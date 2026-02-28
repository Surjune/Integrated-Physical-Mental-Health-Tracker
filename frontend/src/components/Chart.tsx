import React, { useEffect, useRef } from "react";

interface ChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  label: string;
  type: "line" | "bar";
  color: string;
}

const Chart: React.FC<ChartProps> = ({ data, label, type, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "rgba(30, 41, 59, 0)");
    bgGradient.addColorStop(1, "rgba(15, 118, 110, 0.05)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
      ctx.textAlign = "center";
      ctx.fillText("No data available", width / 2, height / 2);
      return;
    }

    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    const pointSpacing = graphWidth / Math.max(data.length - 1, 1);

    if (type === "line") {
      // Draw line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + index * pointSpacing;
        const y = height - padding - ((point.value - minValue) / range) * graphHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw gradient fill under line
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, color + "30");
      gradient.addColorStop(1, color + "05");
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw points
      data.forEach((point, index) => {
        const x = padding + index * pointSpacing;
        const y = height - padding - ((point.value - minValue) / range) * graphHeight;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Draw bar chart
      const barWidth = graphWidth / (data.length * 1.5);

      data.forEach((point, index) => {
        const x = padding + index * pointSpacing + pointSpacing * 0.25;
        const barHeight = ((point.value - minValue) / range) * graphHeight;
        const y = height - padding - barHeight;

        // Bar gradient
        const barGradient = ctx.createLinearGradient(0, y, 0, height - padding);
        barGradient.addColorStop(0, color);
        barGradient.addColorStop(1, color + "80");

        ctx.fillStyle = barGradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Bar border
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
      });
    }

    // Draw labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
    ctx.textAlign = "center";

    // X-axis labels (show every nth label to avoid crowding)
    const labelStep = Math.ceil(data.length / 5);
    data.forEach((point, index) => {
      if (index % labelStep === 0) {
        const x = padding + index * pointSpacing;
        ctx.fillText(point.date, x, height - padding + 20);
      }
    });

    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', bold";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }, [data, type, color, label]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={250}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        borderRadius: "8px",
      }}
    />
  );
};

export default Chart;
