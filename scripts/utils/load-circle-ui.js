export function createTriangleNodes(container, nodeCount = 3) {
    const centerX = 200;
    const centerY = 200;
    const radius = 180;
  
    // Remove existing nodes
    container.querySelectorAll('.circle:not(.center)').forEach(node => node.remove());
  
    for (let i = 0; i < nodeCount; i++) {
      const angleDeg = 90 + (360 / nodeCount) * i;
      const angleRad = angleDeg * (Math.PI / 180);
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY - radius * Math.sin(angleRad);
  
      const node = document.createElement('div');
      node.classList.add('circle', `node-${i + 1}`);
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.transform = 'translate(-50%, -50%)';
  
      container.appendChild(node);
    }
  }
  