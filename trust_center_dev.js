// SVG Tooltip Hover Behavior (svg is inline in the section)
    document.addEventListener('DOMContentLoaded', function() {
      const nodeGroups = document.querySelectorAll('.node-group');
      const tooltip = document.getElementById('svg-tooltip');
      const svg = document.getElementById('flowchart-svg') || document.querySelector('.flowchart-svg');

      nodeGroups.forEach(group => {
        group.addEventListener('mouseenter', function(e) {
        const tooltipText = this.getAttribute('data-tooltip')
        tooltip.innerHTML = tooltipText;
          if (tooltipText) {
            
            tooltip.classList.add('visible');

            // visual hover state
            this.classList.add('hovered');

            // Position tooltip below the element using the svg's client rect
            const svgRect = svg.getBoundingClientRect();

            // Get the rect element's position from SVG coordinates
            const rect = this.querySelector('rect');
            const x = parseFloat(rect.getAttribute('x'));
            const y = parseFloat(rect.getAttribute('y'));
            const width = parseFloat(rect.getAttribute('width'));
            const height = parseFloat(rect.getAttribute('height'));

            // Map viewBox (1000x600) coordinates to client pixels
            const scaleX = svgRect.width / 1000;
            const scaleY = svgRect.height / 600;
            const elemCenterX = svgRect.left + (x + width / 2) * scaleX;
            const elemBottomY = svgRect.top + (y + height) * scaleY;

            tooltip.style.left = (elemCenterX - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = (elemBottomY + 10) + 'px';
          }
        });

        group.addEventListener('mouseleave', function() {
          tooltip.classList.remove('visible');
          this.classList.remove('hovered');
        });
      });
    });


