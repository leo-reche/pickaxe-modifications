document.addEventListener('DOMContentLoaded', function () {
  // 1. URL CHECK (Commented out for testing - uncomment in production)
  // const targetURL = "/trust_center";
  // if (!window.location.href.includes(targetURL)) return;

  const nodeGroups = document.querySelectorAll('.node-group');
  const tooltip = document.getElementById('svg-tooltip');
  const svg = document.getElementById('flowchart-svg');

  if (!svg || !tooltip || nodeGroups.length === 0) {
      console.warn("Trust Chart elements not found");
      return;
  }

  nodeGroups.forEach(group => {
    group.addEventListener('mouseenter', function(e) {
      const tooltipText = this.getAttribute('data-tooltip');
      if (!tooltipText) return;

      tooltip.innerHTML = tooltipText;
      tooltip.classList.add('visible');
      this.classList.add('hovered');

      // 2. POSITIONING LOGIC
      const svgRect = svg.getBoundingClientRect();
      const rect = this.querySelector('rect');

      const x = parseFloat(rect.getAttribute('x'));
      const y = parseFloat(rect.getAttribute('y'));
      const width = parseFloat(rect.getAttribute('width'));
      const height = parseFloat(rect.getAttribute('height'));

      // Calculate scale based on actual rendered size vs viewBox (1000x600)
      const scaleX = svgRect.width / 1000;
      const scaleY = svgRect.height / 600;

      // Position relative to the viewport (since tooltip is position: fixed)
      const elemCenterX = svgRect.left + (x + width / 2) * scaleX;
      const elemBottomY = svgRect.top + (y + height) * scaleY;

      tooltip.style.left = (elemCenterX - tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = (elemBottomY + 10) + 'px';
    });

    group.addEventListener('mouseleave', function () {
      console.log("I was hovered")
      tooltip.classList.remove('visible');
      this.classList.remove('hovered');
    });
  });
});
