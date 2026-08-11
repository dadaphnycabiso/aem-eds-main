export default function decorate(block) {
  const pic = block.querySelector('picture');
  if (pic) {
    const section = pic.closest('div');
    if (section) section.classList.add('hero-image');
  }
}
