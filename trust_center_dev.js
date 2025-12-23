document.addEventListener('DOMContentLoaded', function () {
  // 1. URL Check (Be careful with this during dev!)
  const targetURL = "/trust_center";
  if (!window.location.href.includes(targetURL)) {
    console.log("Not on the target page. Script aborted.");
    return; 
  }

  // 2. The Robust Waiter
  const maxAttempts = 20; // Try for 10 seconds total
  let attempts = 0;

  function initFlowchart() {
    const nodeGroups = document.querySelectorAll('.node-group');
    const tooltip = document.getElementById('svg-tooltip');
    const svg = document.getElementById('flowchart-svg');

    if (svg && tooltip && nodeGroups.length > 0) {
      console.log("Elements found! Initializing hover behaviors...");
      setupHoverListeners(nodeGroups, tooltip, svg);
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Elements not found yet. Attempt ${attempts}...`);
        setTimeout(initFlowchart, 500); // Wait 500ms and try again
      } else {
        console.error("Timed out: Trust Chart elements never appeared in the DOM.");
      }
    }
  }

  function setupHoverListeners(nodeGroups, tooltip, svg) {
    nodeGroups.forEach(group => {
      group.addEventListener('mouseenter', function(e) {
        const tooltipText = this.getAttribute('data-tooltip');
        if (!tooltipText) return;

        tooltip.innerHTML = tooltipText;
        tooltip.classList.add('visible');
        this.classList.add('hovered');

        // Position Logic
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
      });

      group.addEventListener('mouseleave', function () {
        tooltip.classList.remove('visible');
        this.classList.remove('hovered');
      });
    });
  }

  initFlowchart(); // Start the first check
});
