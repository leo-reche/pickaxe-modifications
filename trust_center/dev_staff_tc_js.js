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

      // Initialize Database Entry Viewer: Open first section by default
      const firstSection = document.querySelector('.db-section');
      if (firstSection) {
        const firstToggle = firstSection.querySelector('.db-section-toggle');
        const firstContent = firstSection.querySelector('.db-section-content');
        if (firstToggle && firstContent) {
          firstContent.classList.add('open');
          firstToggle.classList.add('active');
        }
      }

      // JSON tree viewer (second database-entry-viewer): expand/collapse
      const jsonTreeSection = document.querySelector('.database-entry-viewer--json-tree');
      if (jsonTreeSection) {
        jsonTreeSection.querySelectorAll('.json-tree-btn:not(.json-tree-invisible)').forEach(function(btn) {
          btn.addEventListener('click', function() {
            const row = this.closest('.json-tree-row');
            if (!row || !row.classList.contains('json-tree-expandable')) return;
            const isExpanded = row.classList.contains('json-tree-expanded');
            row.classList.toggle('json-tree-expanded', !isExpanded);
            row.classList.toggle('json-tree-collapsed', isExpanded);
            this.classList.toggle('json-tree-expanded', !isExpanded);
            this.classList.toggle('json-tree-collapsed', isExpanded);
          });
        });
      }

      // Flow mobile (phone): tap step to reveal next step (progressive reveal)
      const flowMobile = document.querySelector('.flow-mobile');
      if (flowMobile) {
        flowMobile.querySelectorAll('.flow-step-inner').forEach(function(inner) {
          function revealNext() {
            const step = inner.closest('.flow-step');
            if (!step) return;
            step.classList.add('opened');
            const nextStep = step.nextElementSibling;
            if (nextStep && nextStep.classList.contains('flow-step')) {
              nextStep.classList.add('revealed');
            }
          }
          inner.addEventListener('click', revealNext);
          inner.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              revealNext();
            }
          });
        });
      }
    });

    // Database Entry Viewer Toggle Functionality
    function toggleSection(button) {
      const section = button.closest('.db-section');
      const content = section.querySelector('.db-section-content');
      const isOpen = content.classList.contains('open');
      
      if (isOpen) {
        content.classList.remove('open');
        button.classList.remove('active');
      } else {
        content.classList.add('open');
        button.classList.add('active');
      }
    }
