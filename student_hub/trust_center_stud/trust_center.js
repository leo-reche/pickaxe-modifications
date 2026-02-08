document.addEventListener('DOMContentLoaded', function () {
  const targetURL = "/trust_center";
  let isInitialized = false;

  // 1. THE MAIN CONTROLLER
  function handleLocationChange() {
    const currentPath = window.location.pathname;

    if (currentPath.includes(targetURL)) {
      initFlowchart();
    } else {
      isInitialized = false; // Reset if user leaves the page
    }
  }

  // 2. THE ROBUST WAITER (Your existing polling logic)
  let attempts = 0;
  function initFlowchart() {
    // Prevent multiple initializations on the same page instance
    if (isInitialized) return;

    const nodeGroups = document.querySelectorAll('.node-group');
    const tooltip = document.getElementById('svg-tooltip');
    const svg = document.getElementById('flowchart-svg');

    if (svg && tooltip && nodeGroups.length > 0) {
      setupHoverListeners(nodeGroups, tooltip, svg);
      isInitialized = true; // Mark as done for this page load
      attempts = 0; 
    } else {
      attempts++;
      if (attempts < 20) { // Try for 10 seconds
        setTimeout(initFlowchart, 500);
      } else {
        console.error("Timed out waiting for Trust Center elements.");
      }
    }
  }

  // 3. THE NAVIGATION INTERCEPTOR
  // This wraps the browser's navigation functions to trigger our check
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    handleLocationChange();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    handleLocationChange();
  };

  // Listen for back/forward button clicks
  window.addEventListener('popstate', handleLocationChange);

  // 4. SETUP HOVER LISTENERS (Your core logic)
  function setupHoverListeners(nodeGroups, tooltip, svg) {
    nodeGroups.forEach(group => {
      group.addEventListener('mouseenter', function (e) {
        const tooltipText = this.getAttribute('data-tooltip');
        if (!tooltipText) return;

        tooltip.innerHTML = tooltipText;
        tooltip.classList.add('visible');
        this.classList.add('hovered');

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

  // 5. RUN ON INITIAL LOAD
  handleLocationChange();
});
