import * as d3 from 'd3';

class TreeRenderer {
    constructor(containerId) {
        this.containerId = containerId;
        this.width = 800;
        this.height = 600;
        this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        this.zoom = null;
        this.svg = null;
        this.g = null;
    }

    // Create tree data structure from clients
    createTreeData(clientes) {
        const root = {
            name: "Árvore dos Sonhos",
            children: []
        };

        // Group clients by status (active/inactive)
        const activeClients = clientes.filter(cliente => 
            cliente.nivel >= 8 && cliente.humor >= 2
        );
        const inactiveClients = clientes.filter(cliente => 
            !(cliente.nivel >= 8 && cliente.humor >= 2)
        );

        // Add active clients as green branches
        if (activeClients.length > 0) {
            root.children.push({
                name: "Clientes Ativos",
                children: activeClients.map(cliente => ({
                    name: cliente.cliente_id,
                    cliente: cliente,
                    status: 'active',
                    points: this.calculatePoints(cliente.nivel)
                }))
            });
        }

        // Add inactive clients as red branches
        if (inactiveClients.length > 0) {
            root.children.push({
                name: "Clientes Inativos",
                children: inactiveClients.map(cliente => ({
                    name: cliente.cliente_id,
                    cliente: cliente,
                    status: 'inactive',
                    points: 0
                }))
            });
        }

        return root;
    }

    // Calculate points based on client level
    calculatePoints(nivel) {
        if (nivel === 8) return 1;
        if (nivel === 9) return 2;
        if (nivel === 10) return 3;
        return 0;
    }

    // Get color based on client mood
    getMoodColor(humor) {
        const colors = {
            1: '#e53e3e', // red
            2: '#d69e2e', // yellow
            3: '#3182ce', // blue
            4: '#38a169'  // green
        };
        return colors[humor] || '#718096';
    }

    // Get branch size based on client level
    getBranchSize(nivel) {
        return Math.max(3, nivel * 0.8);
    }

    // Count total nodes in tree data
    countNodes(data) {
        let count = 1; // Count current node
        if (data.children) {
            count += data.children.reduce((sum, child) => sum + this.countNodes(child), 0);
        }
        return count;
    }

    // Create detailed tooltip content
    createTooltipContent(cliente, points, status) {
        const humorText = {
            1: '😠 Irritado',
            2: '😐 Neutro', 
            3: '😊 Satisfeito',
            4: '😄 Muito Feliz'
        };

        const statusText = status === 'active' ? '✅ Ativo' : '❌ Inativo';
        const pointsText = points > 0 ? `🎯 ${points} pontos/dia` : '💤 Não gera pontos';

        return `
            <div style="padding: 10px; font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #2d3748;">${cliente.cliente_id}</h4>
                <div style="font-size: 12px; line-height: 1.4;">
                    <div><strong>Status:</strong> ${statusText}</div>
                    <div><strong>Nível:</strong> ${cliente.nivel}/10</div>
                    <div><strong>Humor:</strong> ${humorText[cliente.humor] || cliente.humor}</div>
                    <div><strong>Pontos:</strong> ${pointsText}</div>
                    ${cliente.data_ultima_interacao ? 
                        `<div><strong>Última Interação:</strong> ${new Date(cliente.data_ultima_interacao).toLocaleDateString('pt-BR')}</div>` : 
                        ''
                    }
                </div>
            </div>
        `;
    }

    // Render the tree
    render(clientes, playerStats = {}) {
        const container = d3.select(this.containerId);
        container.selectAll("*").remove();

        const treeData = this.createTreeData(clientes);
        
        const width = this.width - this.margin.left - this.margin.right;
        const height = this.height - this.margin.top - this.margin.bottom;
        
        // Calculate dynamic tree size based on number of nodes
        const totalNodes = this.countNodes(treeData);
        const dynamicHeight = Math.max(height, totalNodes * 40);
        const dynamicWidth = Math.max(width, totalNodes * 30);

        // Create SVG with zoom support
        this.svg = container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("cursor", "grab");

        // Create main group for zoom
        this.g = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Setup zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on("zoom", (event) => {
                this.g.attr("transform", event.transform);
                this.svg.style("cursor", event.transform.k === 1 ? "grab" : "move");
            })
            .on("end", () => {
                this.svg.style("cursor", "grab");
            });

        this.svg.call(this.zoom);

        // Create tree layout (VERTICAL) with better spacing
        const tree = d3.tree()
            .size([dynamicWidth, dynamicHeight])
            .separation((a, b) => {
                // Increase separation between nodes
                return (a.parent === b.parent ? 1.2 : 1.5);
            });
        const root = d3.hierarchy(treeData);
        tree(root);

        // Create links (vertical orientation)
        const links = this.g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y))
            .attr("fill", "none")
            .attr("stroke", "#718096")
            .attr("stroke-width", 2)
            .style("opacity", 0.6);

        // Create nodes
        const nodes = this.g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .style("cursor", d => d.data.cliente ? "pointer" : "default");

        // Add circles for nodes
        nodes.append("circle")
            .attr("r", d => {
                if (d.data.cliente) {
                    return this.getBranchSize(d.data.cliente.nivel);
                }
                return d.children ? 10 : 8;
            })
            .attr("fill", d => {
                if (d.data.cliente) {
                    return this.getMoodColor(d.data.cliente.humor);
                }
                return "#4a5568";
            })
            .attr("stroke", d => {
                if (d.data.status === 'active') {
                    return "#38a169";
                } else if (d.data.status === 'inactive') {
                    return "#e53e3e";
                }
                return "#2d3748";
            })
            .attr("stroke-width", d => {
                if (d.data.status === 'active') {
                    return 3;
                }
                return 1;
            })
            .style("transition", "all 0.3s ease")
            .on("mouseover", function(event, d) {
                if (d.data.cliente) {
                    d3.select(this)
                        .attr("r", d => this.getBranchSize(d.data.cliente.nivel) * 1.2)
                        .style("filter", "drop-shadow(0 0 8px rgba(0,0,0,0.3))");
                }
            })
            .on("mouseout", function(event, d) {
                if (d.data.cliente) {
                    d3.select(this)
                        .attr("r", d => this.getBranchSize(d.data.cliente.nivel))
                        .style("filter", "none");
                }
            });

        // Add fruit icons for active clients
        nodes.filter(d => d.data.status === 'active')
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "14px")
            .text("🍎");

        // Add labels with better positioning and background
        const labels = nodes.append("text")
            .attr("dy", d => {
                if (d.children) {
                    return -25; // Parent nodes above
                }
                // Alternate position for leaf nodes to avoid overlap
                const index = d.parent ? d.parent.children.indexOf(d) : 0;
                return index % 2 === 0 ? 25 : -25;
            })
            .attr("x", d => {
                if (d.children) {
                    return -15; // Parent nodes to the left
                }
                // Alternate side for leaf nodes
                const index = d.parent ? d.parent.children.indexOf(d) : 0;
                return index % 2 === 0 ? 15 : -15;
            })
            .attr("text-anchor", d => {
                if (d.children) {
                    return "end";
                }
                // Alternate anchor for leaf nodes
                const index = d.parent ? d.parent.children.indexOf(d) : 0;
                return index % 2 === 0 ? "start" : "end";
            })
            .attr("font-size", "10px")
            .attr("fill", "#4a5568")
            .style("pointer-events", "none")
            .style("font-weight", "500")
            .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)")
            .text(d => {
                if (d.data.cliente) {
                    // Shorten the label to avoid overlap
                    const clienteId = d.data.cliente.cliente_id;
                    const shortId = clienteId.length > 8 ? clienteId.substring(0, 8) + '...' : clienteId;
                    return `${shortId} (N${d.data.cliente.nivel})`;
                }
                return d.data.name;
            });

        // Create tooltip div
        const tooltip = d3.select("body").append("div")
            .attr("class", "tree-tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "8px")
            .style("padding", "0")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
            .style("z-index", 1000)
            .style("max-width", "250px");

        // Add click events for detailed tooltips
        nodes.filter(d => d.data.cliente)
            .on("click", (event, d) => {
                const cliente = d.data.cliente;
                const points = d.data.points;
                const status = d.data.status;

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html(this.createTooltipContent(cliente, points, status))
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add player stats if available
        if (playerStats.avg_level || playerStats.avg_mood) {
            const statsGroup = this.g.append("g")
                .attr("class", "player-stats")
                .attr("transform", `translate(10, 10)`);

            // Background for stats
            statsGroup.append("rect")
                .attr("width", 200)
                .attr("height", 80)
                .attr("fill", "rgba(255,255,255,0.9)")
                .attr("stroke", "#e2e8f0")
                .attr("stroke-width", 1)
                .attr("rx", 8);

            statsGroup.append("text")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", "#2d3748")
                .attr("transform", "translate(10, 20)")
                .text("📊 Estatísticas do Jogador");

            if (playerStats.avg_level) {
                statsGroup.append("text")
                    .attr("font-size", "12px")
                    .attr("fill", "#4a5568")
                    .attr("transform", "translate(10, 40)")
                    .text(`Nível Médio: ${playerStats.avg_level}`);
            }

            if (playerStats.avg_mood) {
                statsGroup.append("text")
                    .attr("font-size", "12px")
                    .attr("fill", "#4a5568")
                    .attr("transform", "translate(10, 55)")
                    .text(`Humor Médio: ${playerStats.avg_mood}`);
            }
        }

        // Add zoom controls
        this.addZoomControls();

        return this.g;
    }

    // Add zoom controls
    addZoomControls() {
        const controls = this.svg.append("g")
            .attr("class", "zoom-controls")
            .attr("transform", `translate(${this.width - 60}, 20)`);

        // Zoom in button
        controls.append("circle")
            .attr("cx", 20)
            .attr("cy", 20)
            .attr("r", 15)
            .attr("fill", "white")
            .attr("stroke", "#718096")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("click", () => {
                this.svg.transition().duration(300).call(
                    this.zoom.scaleBy, 1.3
                );
            });

        controls.append("text")
            .attr("x", 20)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "16px")
            .text("+");

        // Zoom out button
        controls.append("circle")
            .attr("cx", 20)
            .attr("cy", 50)
            .attr("r", 15)
            .attr("fill", "white")
            .attr("stroke", "#718096")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("click", () => {
                this.svg.transition().duration(300).call(
                    this.zoom.scaleBy, 0.7
                );
            });

        controls.append("text")
            .attr("x", 20)
            .attr("y", 50)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "16px")
            .text("−");

        // Reset button
        controls.append("circle")
            .attr("cx", 20)
            .attr("cy", 80)
            .attr("r", 15)
            .attr("fill", "white")
            .attr("stroke", "#718096")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("click", () => {
                this.svg.transition().duration(300).call(
                    this.zoom.transform, d3.zoomIdentity
                );
            });

        controls.append("text")
            .attr("x", 20)
            .attr("y", 80)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "12px")
            .text("⌂");
    }

    // Update tree with new data
    update(clientes, playerStats) {
        this.render(clientes, playerStats);
    }

    // Reset zoom
    resetZoom() {
        if (this.svg && this.zoom) {
            this.svg.transition().duration(300).call(
                this.zoom.transform, d3.zoomIdentity
            );
        }
    }
}

export default TreeRenderer; 