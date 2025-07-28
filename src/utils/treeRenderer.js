import * as d3 from 'd3';

class TreeRenderer {
    constructor(containerId) {
        this.containerId = containerId;
        this.width = 800;
        this.height = 600;
        this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
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
        return Math.max(2, nivel * 0.5);
    }

    // Render the tree
    render(clientes, playerStats = {}) {
        const container = d3.select(this.containerId);
        container.selectAll("*").remove();

        const treeData = this.createTreeData(clientes);
        
        const width = this.width - this.margin.left - this.margin.right;
        const height = this.height - this.margin.top - this.margin.bottom;

        const svg = container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Create tree layout
        const tree = d3.tree().size([height, width]);
        const root = d3.hierarchy(treeData);
        tree(root);

        // Create links
        const links = svg.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
            .attr("fill", "none")
            .attr("stroke", "#718096")
            .attr("stroke-width", 2);

        // Create nodes
        const nodes = svg.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`);

        // Add circles for nodes
        nodes.append("circle")
            .attr("r", d => {
                if (d.data.cliente) {
                    return this.getBranchSize(d.data.cliente.nivel);
                }
                return d.children ? 8 : 6;
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
            });

        // Add fruit icons for active clients
        nodes.filter(d => d.data.status === 'active')
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .text("🍎");

        // Add labels
        nodes.append("text")
            .attr("dy", d => d.children ? -15 : 15)
            .attr("x", d => d.children ? -8 : 8)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .attr("font-size", "10px")
            .attr("fill", "#4a5568")
            .text(d => {
                if (d.data.cliente) {
                    return `${d.data.cliente.cliente_id} (N${d.data.cliente.nivel})`;
                }
                return d.data.name;
            });

        // Add tooltips
        nodes.filter(d => d.data.cliente)
            .append("title")
            .text(d => {
                const cliente = d.data.cliente;
                const points = d.data.points;
                const status = d.data.status === 'active' ? 'Ativo' : 'Inativo';
                return `Cliente: ${cliente.cliente_id}
Nível: ${cliente.nivel}
Humor: ${cliente.humor}
Status: ${status}
${points > 0 ? `Pontos: ${points}` : 'Não gera pontos'}`;
            });

        // Add player stats if available
        if (playerStats.avg_level || playerStats.avg_mood) {
            const statsGroup = svg.append("g")
                .attr("class", "player-stats")
                .attr("transform", `translate(10, 10)`);

            statsGroup.append("text")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", "#2d3748")
                .text("📊 Estatísticas do Jogador");

            if (playerStats.avg_level) {
                statsGroup.append("text")
                    .attr("font-size", "12px")
                    .attr("fill", "#4a5568")
                    .attr("transform", "translate(0, 20)")
                    .text(`Nível Médio: ${playerStats.avg_level}`);
            }

            if (playerStats.avg_mood) {
                statsGroup.append("text")
                    .attr("font-size", "12px")
                    .attr("fill", "#4a5568")
                    .attr("transform", "translate(0, 35)")
                    .text(`Humor Médio: ${playerStats.avg_mood}`);
            }
        }

        return svg;
    }

    // Update tree with new data
    update(clientes, playerStats) {
        this.render(clientes, playerStats);
    }
}

export default TreeRenderer; 