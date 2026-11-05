import BASE_URL, { getAuthHeaders } from "./config.js";

const form = document.getElementById("homepage-ingredients-form");
const statusEl = document.getElementById("ingredients-form-status");
const uploadButton = document.getElementById("ingredients-upload-button");
const saveButton = document.getElementById("ingredients-save-button");
const imageFileInput = document.getElementById("ingredients-image-file");
const imageUrlInput = document.getElementById("ingredients-image-url");
const imageAltInput = document.getElementById("ingredients-image-alt");
const imagePreview = document.getElementById("ingredients-image-preview");

function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.className = `rounded-xl p-3 text-sm ${isError
        ? "bg-rose-50 text-rose-700 border border-rose-200"
        : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`;
}

function setImagePreview(url, alt = "") {
    imagePreview.src = url;
    imagePreview.alt = alt;
}

async function loadSection() {
    try {
        const response = await fetch(`${BASE_URL}/api/homepage-ingredients`, { cache: "no-cache" });
        const result = await response.json();
        if (!response.ok || !result.success || !result.data) {
            throw new Error(result.message || "Could not load homepage section settings.");
        }

        const content = result.data;
        form.elements.eyebrow.value = content.eyebrow || "";
        form.elements.heading.value = content.heading || "";
        form.elements.description.value = content.description || "";
        form.elements.buttonText.value = content.buttonText || "";
        form.elements.buttonUrl.value = content.buttonUrl || "";
        imageUrlInput.value = content.imageUrl || "";
        imageAltInput.value = content.imageAlt || "";
        form.elements.isEnabled.checked = content.isEnabled !== false;
        setImagePreview(content.imageUrl || "./static/placeholder.png", content.imageAlt || "");
    } catch (error) {
        console.error("Could not load homepage section settings:", error);
        showStatus(error.message, true);
    }
}

imageUrlInput.addEventListener("input", () => {
    if (imageUrlInput.value.trim()) setImagePreview(imageUrlInput.value.trim(), imageAltInput.value);
});

imageAltInput.addEventListener("input", () => {
    imagePreview.alt = imageAltInput.value;
});

uploadButton.addEventListener("click", async () => {
    const file = imageFileInput.files?.[0];
    if (!file) {
        showStatus("Choose an image file first.", true);
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showStatus("Image must be 5 MB or smaller.", true);
        return;
    }

    const originalText = uploadButton.innerHTML;
    uploadButton.disabled = true;
    uploadButton.textContent = "Uploading...";
    try {
        const body = new FormData();
        body.append("image", file);
        const response = await fetch(`${BASE_URL}/api/homepage-ingredients/upload-image`, {
            method: "POST",
            headers: getAuthHeaders({}, false),
            credentials: "include",
            body
        });
        const result = await response.json();
        if (!response.ok || !result.success || !result.imageUrl) {
            throw new Error(result.message || "Image upload failed.");
        }

        imageUrlInput.value = result.imageUrl;
        setImagePreview(result.imageUrl, imageAltInput.value);
        showStatus("Image uploaded. Save the section to publish it.");
    } catch (error) {
        console.error("Homepage image upload failed:", error);
        showStatus(error.message, true);
    } finally {
        uploadButton.disabled = false;
        uploadButton.innerHTML = originalText;
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    const payload = {
        eyebrow: form.elements.eyebrow.value.trim(),
        heading: form.elements.heading.value.trim(),
        description: form.elements.description.value.trim(),
        buttonText: form.elements.buttonText.value.trim(),
        buttonUrl: form.elements.buttonUrl.value.trim(),
        imageUrl: imageUrlInput.value.trim(),
        imageAlt: imageAltInput.value.trim(),
        isEnabled: form.elements.isEnabled.checked
    };

    try {
        const response = await fetch(`${BASE_URL}/api/homepage-ingredients`, {
            method: "PUT",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not save homepage section.");
        }
        showStatus("Homepage section saved successfully.");
    } catch (error) {
        console.error("Homepage section save failed:", error);
        showStatus(error.message, true);
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i> Save Homepage Section';
    }
});

loadSection();
