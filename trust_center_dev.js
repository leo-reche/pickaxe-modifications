document.addEventListener('DOMContentLoaded', function () {
  // Only run script on this specific page
  const targetURL = "studio.pickaxe.co/STUDIOZZI1GRX9TOI3H1H/trust_cent";
  if (!window.location.href.includes(targetURL)) {
    return; // Stop completely if not on the correct URL
  }

  // --- Your SVG Tooltip Hover Behavior ---
  const nodeGroups = document.querySelectorAll('.node-group');
  const tooltip = document.getElementById('svg-tooltip');
  const svg = document.getElementById('flowchart-svg') || document.querySelector('.flowchart-svg');

  if (!svg || !tooltip || nodeGroups.length === 0) return;

  nodeGroups.forEach(group => {
    group.addEventListener('mouseenter', function(e) {
      const tooltipText = this.getAttribute('data-tooltip');
      tooltip.innerHTML = tooltipText;

      if (tooltipText) {
        tooltip.classList.add('visible');
        this.classList.add('hovered');

        // Position tooltip
        const svgRect = svg.getBoundingClientRect();
        const rect = this.querySelector('rect');

        const x = parseFloat(rect.getAttribute('x'));
        const y = parseFloat(rect.getAttribute('y'));
        const width = parseFloat(rect.getAttribute('width'));
        const height = parseFloat(rect.getAttribute('height'));

        const scaleX = svgRect.width / 1000;
        const scaleY = svgRect.height / 600;

        const elemCenterX = svgRect.left + (x + width / 2) * scaleX;
        const elemBottomY = svgRect.top + (y + height) * scaleY;

        tooltip.style.left = (elemCenterX - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (elemBottomY + 10) + 'px';
      }
    });

    group.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
      this.classList.remove('hovered');
    });
  });
});

