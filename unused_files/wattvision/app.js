document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('consumptionChart').getContext('2d');

    // Create a smooth gradient for the area chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(0, 229, 255, 0.4)'); // Cyan top
    gradient.addColorStop(1, 'rgba(50, 215, 75, 0.0)');  // Green/transparent bottom

    // Mock data for 24 hours
    const labels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '23:59'];
    const dataPoints = [150, 140, 150, 200, 800, 1200, 1100, 3100, 1800, 1500, 2200, 1400, 300];

    // Chart.js configuration
    Chart.defaults.color = '#98989D';
    Chart.defaults.font.family = "'Inter', sans-serif";

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Consumo (Watts)',
                data: dataPoints,
                borderColor: '#00E5FF', // Cyan line
                backgroundColor: gradient, // Gradient fill
                borderWidth: 2,
                pointBackgroundColor: '#1E1E1E',
                pointBorderColor: '#00E5FF',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4 // Smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide legend
                },
                tooltip: {
                    backgroundColor: '#1E1E1E',
                    titleColor: '#98989D',
                    bodyColor: '#FFFFFF',
                    bodyFont: {
                        family: "'JetBrains Mono', monospace",
                        size: 14,
                        weight: 'bold'
                    },
                    borderColor: '#2C2C2E',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' W';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#2C2C2E',
                        drawBorder: false,
                        tickLength: 0
                    },
                    ticks: {
                        padding: 10,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    grid: {
                        color: '#2C2C2E',
                        drawBorder: false,
                        tickLength: 0
                    },
                    ticks: {
                        padding: 10,
                        font: {
                            family: "'JetBrains Mono', monospace",
                            size: 12
                        },
                        callback: function(value) {
                            return value + ' W';
                        }
                    },
                    beginAtZero: true,
                    suggestedMax: 3500
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });
});
