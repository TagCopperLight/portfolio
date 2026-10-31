// Clicking a project image shows it full screen; a click or Escape closes it.
export function initLightbox(root: Document = document): void {
  const shots = root.querySelectorAll<HTMLImageElement>("img.shot");
  if (shots.length === 0) return;

  const dialog = root.createElement("dialog");
  dialog.className = "lightbox";
  const image = root.createElement("img");
  dialog.append(image);
  root.body.append(dialog);

  dialog.addEventListener("click", () => dialog.close());
  for (const shot of shots) {
    shot.addEventListener("click", async () => {
      image.src = shot.currentSrc;
      image.alt = shot.alt;
      await image.decode();
      // Scaling past the file's real pixels is what makes an image blurry.
      image.style.maxWidth = `min(100%, ${image.naturalWidth / devicePixelRatio}px)`;
      dialog.showModal();
    });
  }
}
