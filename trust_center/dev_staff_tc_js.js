    (function() {
      const targetURL = '/';
      let isInitialized = false;
      let attempts = 0;

      function handleLocationChange() {
        const currentPath = window.location.pathname;
        if (currentPath.includes(targetURL)) {
          initTrustCenter();
        } else {
          isInitialized = false;
        }
      }

      function setupHoverListeners(nodeGroups, tooltip, svg) {
        nodeGroups.forEach(function(group) {
          group.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            tooltip.innerHTML = tooltipText || '';
            if (tooltipText) {
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
            }
          });
          group.addEventListener('mouseleave', function() {
            tooltip.classList.remove('visible');
            this.classList.remove('hovered');
          });
        });
      }

      function initTrustCenter() {
        if (isInitialized) return;

        const nodeGroups = document.querySelectorAll('.staff-node-group');
        const tooltip = document.getElementById('staff-svg-tooltip');
        const svg = document.getElementById('staff-flowchart-svg') || document.querySelector('.staff-flowchart-svg');

        if (svg && tooltip && nodeGroups.length > 0) {
          setupHoverListeners(nodeGroups, tooltip, svg);

          var firstSection = document.querySelector('.staff-db-section');
          if (firstSection) {
            var firstToggle = firstSection.querySelector('.staff-db-section-toggle');
            var firstContent = firstSection.querySelector('.staff-db-section-content');
            if (firstToggle && firstContent) {
              firstContent.classList.add('open');
              firstToggle.classList.add('active');
            }
          }

          var jsonTreeSection = document.querySelector('.staff-database-entry-viewer--json-tree');
          if (jsonTreeSection) {
            jsonTreeSection.querySelectorAll('.staff-json-tree-btn:not(.staff-json-tree-invisible)').forEach(function(btn) {
              btn.addEventListener('click', function() {
                var row = this.closest('.staff-json-tree-row');
                if (!row || !row.classList.contains('staff-json-tree-expandable')) return;
                var isExpanded = row.classList.contains('staff-json-tree-expanded');
                row.classList.toggle('staff-json-tree-expanded', !isExpanded);
                row.classList.toggle('staff-json-tree-collapsed', isExpanded);
                this.classList.toggle('staff-json-tree-expanded', !isExpanded);
                this.classList.toggle('staff-json-tree-collapsed', isExpanded);
              });
            });
          }

          var flowMobile = document.querySelector('.staff-flow-mobile');
          if (flowMobile) {
            flowMobile.querySelectorAll('.staff-flow-step-inner').forEach(function(inner) {
              function revealNext() {
                var step = inner.closest('.staff-flow-step');
                if (!step) return;
                step.classList.add('opened');
                var nextStep = step.nextElementSibling;
                if (nextStep && nextStep.classList.contains('staff-flow-step')) {
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

          isInitialized = true;
          attempts = 0;
        } else {
          attempts++;
          if (attempts < 20) {
            setTimeout(initTrustCenter, 500);
          }
        }
      }

      var originalPushState = history.pushState;
      history.pushState = function() {
        originalPushState.apply(this, arguments);
        handleLocationChange();
      };
      var originalReplaceState = history.replaceState;
      history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        handleLocationChange();
      };
      window.addEventListener('popstate', handleLocationChange);

      document.addEventListener('DOMContentLoaded', function() {
        handleLocationChange();
      });
    })();

    // Database Entry Viewer Toggle Functionality
    function toggleSection(button) {
      const section = button.closest('.staff-db-section');
      const content = section.querySelector('.staff-db-section-content');
      const isOpen = content.classList.contains('open');
      
      if (isOpen) {
        content.classList.remove('open');
        button.classList.remove('active');
      } else {
        content.classList.add('open');
        button.classList.add('active');
      }
    }
