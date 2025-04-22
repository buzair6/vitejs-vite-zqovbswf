// src/pages/DashboardPage.tsx - ENHANCED KPIs & CHARTS
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, DoughnutController, BarController, LineController, TimeScale } from 'chart.js'; // Added TimeScale
import { Doughnut, Bar, Pie, Line } from 'react-chartjs-2'; // Added Pie, Line
import { Asset, WorkOrder, ToolBooking, WorkOrderStatus, AssetStatus, WorkOrderPriority, WorkOrderType } from '../types';

// --- Register Chart.js Components ---
try { ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, DoughnutController, BarController, LineController, TimeScale ); } // Added TimeScale
catch (error) { console.error("[DashboardPage] ERROR registering Chart.js components:", error); }

// --- Component Props Interface ---
interface DashboardPageProps {
    assets: Asset[];
    workOrders: WorkOrder[];
    toolBookings: ToolBooking[];
}

// --- Helper: Get start of today ---
const getStartOfToday = (): Date => { const today = new Date(); today.setHours(0, 0, 0, 0); return today; };
// --- Helper: Get start of X days ago ---
const getStartOfXDaysAgo = (days: number): Date => { const date = new Date(); date.setDate(date.getDate() - days); date.setHours(0, 0, 0, 0); return date; };


// --- Placeholder Cost Calculation ---
const ESTIMATED_HOURLY_RATE = 50; // Placeholder cost per hour
const estimateLaborCost = (wo: WorkOrder): number => {
    if (wo.actualLaborLog) {
        // Very basic: count numbers in the string, assume they are hours
        const hoursMatch = wo.actualLaborLog.match(/[\d\.]+/g);
        const totalHours = hoursMatch ? hoursMatch.reduce((sum, h) => sum + parseFloat(h || '0'), 0) : 0;
        return totalHours * ESTIMATED_HOURLY_RATE;
    }
    if(wo.estimatedHours) {
        return wo.estimatedHours * ESTIMATED_HOURLY_RATE; // Fallback to estimate if no actual log
    }
    return 0;
};
const estimatePartsCost = (wo: WorkOrder): number => {
     // Very basic: find numbers preceded by $
    if (wo.partsConsumed) {
       const costMatches = wo.partsConsumed.match(/\$\s*([\d\.]+)/g);
       const totalCost = costMatches ? costMatches.reduce((sum, c) => sum + parseFloat(c.replace(/[^0-9.]/g, '') || '0'), 0) : 0;
       // If no '$' found, maybe count items as a fixed cost placeholder
       return totalCost > 0 ? totalCost : (wo.partsConsumed.split(/,|\n/).filter(p => p.trim()).length * 20); // $20 per part item placeholder
    }
     return 0;
};


function DashboardPage({ assets = [], workOrders = [], toolBookings = [] }: DashboardPageProps) {
    console.log("[DashboardPage] Rendering with data lengths:", { assets: assets?.length, workOrders: workOrders?.length, toolBookings: toolBookings?.length });

    // --- Calculate KPIs ---
    const kpis = useMemo(() => {
        const validAssets = Array.isArray(assets) ? assets : [];
        const validWorkOrders = Array.isArray(workOrders) ? workOrders : [];
        const validToolBookings = Array.isArray(toolBookings) ? toolBookings : [];

        const todayStartMs = getStartOfToday().getTime();
        const thirtyDaysAgoMs = getStartOfXDaysAgo(30).getTime();
        const sixtyDaysAgoMs = getStartOfXDaysAgo(60).getTime();

        // Work Order KPIs
        const openStatuses: WorkOrderStatus[] = ['Requested', 'Approved', 'Assigned', 'In Progress', 'On Hold'];
        const closedStatuses: WorkOrderStatus[] = ['Completed', 'Closed', 'Cancelled'];
        const openWOs = validWorkOrders.filter(wo => wo && openStatuses.includes(wo.status));
        const overdueWOs = openWOs.filter(wo => wo && wo.dateDue && new Date(wo.dateDue).getTime() < todayStartMs);
        const criticalOpenWOs = openWOs.filter(wo => wo && wo.priority === 'Critical');
        const completedLast30d = validWorkOrders.filter(wo => wo && closedStatuses.includes(wo.status) && wo.dateActualCompletion && new Date(wo.dateActualCompletion).getTime() >= thirtyDaysAgoMs);

        // PM Compliance (PMs Due in the last 30 days)
        const pmsDueLast30d = validWorkOrders.filter(wo => wo?.type === 'Preventive' && wo.dateDue && new Date(wo.dateDue).getTime() >= thirtyDaysAgoMs && new Date(wo.dateDue).getTime() < todayStartMs);
        const completedPmsDueLast30d = pmsDueLast30d.filter(wo => closedStatuses.includes(wo.status));
        const pmCompliance = pmsDueLast30d.length > 0 ? Math.round((completedPmsDueLast30d.length / pmsDueLast30d.length) * 100) : 100;

        // Cost KPIs (Last 30 days completed) - USING PLACEHOLDERS
        const totalCostLast30d = completedLast30d.reduce((sum, wo) => {
            const labor = estimateLaborCost(wo);
            const parts = estimatePartsCost(wo);
            const external = wo.externalCosts || 0;
            return sum + labor + parts + external;
        }, 0);

        // Reactive vs Preventive Ratio (Last 30 days completed)
        const reactiveCompleted = completedLast30d.filter(wo => wo.type === 'Reactive').length;
        const preventiveCompleted = completedLast30d.filter(wo => wo.type === 'Preventive').length;
        const totalCompletedTypes = reactiveCompleted + preventiveCompleted;
        const reactiveRatio = totalCompletedTypes > 0 ? Math.round((reactiveCompleted / totalCompletedTypes) * 100) : 0;

        // Asset KPIs
        const offlineAssets = validAssets.filter(a => a && a.status !== 'Online');
        const maintenanceAssets = validAssets.filter(a => a && a.status === 'Maintenance');
        const offlineUnplannedAssets = validAssets.filter(a => a && a.status === 'Offline - Unplanned');

        // Booking KPIs
        const pendingBookings = validToolBookings.filter(b => b && b.status === 'pending');
        const approvedBookingsToday = validToolBookings.filter(b => b && b.status === 'approved' && new Date(b.startTime).getTime() >= todayStartMs && new Date(b.startTime).getTime() < todayStartMs + 86400000);


        return {
            totalAssets: validAssets.length, onlineAssets: validAssets.length - offlineAssets.length, offlineAssets: offlineAssets.length, maintenanceAssets: maintenanceAssets.length, offlineUnplannedAssets: offlineUnplannedAssets.length,
            totalOpenWOs: openWOs.length, overdueWOs: overdueWOs.length, criticalOpenWOs: criticalOpenWOs.length,
            pmCompliance: isNaN(pmCompliance) ? 'N/A' : `${pmCompliance}%`,
            totalCostLast30d: totalCostLast30d.toFixed(0), // Format as integer string
            reactiveRatio: `${reactiveRatio}%`,
            pendingBookings: pendingBookings.length,
            approvedBookingsToday: approvedBookingsToday.length,
        };
    }, [assets, workOrders, toolBookings]);

    // --- Prepare Chart Data ---
    // WO Status, Asset Status, Open WO Priority (Keep previous memoized versions)
    const woStatusData = useMemo(() => { /* ... same as before ... */ }, [workOrders]);
    const assetStatusData = useMemo(() => { /* ... same as before ... */ }, [assets]);
    const woPriorityData = useMemo(() => { /* ... same as before ... */ }, [workOrders]);

    // WO Type Distribution (All Time for simplicity, could filter)
    const woTypeData = useMemo(() => {
        if (!Array.isArray(workOrders) || workOrders.length === 0) return { labels: [], datasets: [] };
        const counts: { [key in WorkOrderType]?: number } = {};
        workOrders.forEach(wo => { if(wo?.type) counts[wo.type] = (counts[wo.type] || 0) + 1; });
        const labels = Object.keys(counts).sort() as WorkOrderType[];
        return {
            labels: labels,
            datasets: [{ label: 'WO Types', data: labels.map(t => counts[t] || 0),
                backgroundColor: [ /* Provide distinct colors - more needed maybe */
                    'rgba(46, 204, 113, 0.7)', 'rgba(52, 152, 219, 0.7)', 'rgba(155, 89, 182, 0.7)',
                    'rgba(241, 196, 15, 0.7)', 'rgba(230, 126, 34, 0.7)', 'rgba(149, 165, 166, 0.7)',
                    'rgba(26, 188, 156, 0.7)', 'rgba(231, 76, 60, 0.7)'
                ], borderColor: [ /* solid colors */ ], borderWidth: 1 }]};
    }, [workOrders]);

    // WO Created vs Completed Trend (Last 60 days by week)
    const woTrendData = useMemo(() => {
         if (!Array.isArray(workOrders)) return { labels: [], datasets: [] };
         const labels: string[] = [];
         const createdCounts: number[] = [];
         const completedCounts: number[] = [];
         const today = getStartOfToday();

         // Go back ~8 weeks
         for (let i = 8; i >= 0; i--) {
             const weekEndDate = new Date(today);
             weekEndDate.setDate(today.getDate() - i * 7 + 6); // End of the week (Saturday)
             weekEndDate.setHours(23,59,59,999);

             const weekStartDate = new Date(weekEndDate);
             weekStartDate.setDate(weekEndDate.getDate() - 6);
             weekStartDate.setHours(0,0,0,0); // Start of the week (Sunday)

             const weekStartMs = weekStartDate.getTime();
             const weekEndMs = weekEndDate.getTime();

             labels.push(`Wk Starting ${weekStartDate.toLocaleDateString('en-CA')}`); // YYYY-MM-DD format

             createdCounts.push(
                 workOrders.filter(wo => wo?.dateReported && new Date(wo.dateReported).getTime() >= weekStartMs && new Date(wo.dateReported).getTime() <= weekEndMs).length
             );
             completedCounts.push(
                 workOrders.filter(wo => wo && (wo.status === 'Completed' || wo.status === 'Closed') && wo.dateActualCompletion && new Date(wo.dateActualCompletion).getTime() >= weekStartMs && new Date(wo.dateActualCompletion).getTime() <= weekEndMs).length
             );
         }

         return {
             labels,
             datasets: [
                 { label: 'WOs Created', data: createdCounts, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.5)', tension: 0.1 },
                 { label: 'WOs Completed', data: completedCounts, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', tension: 0.1 }
             ]
         };
    }, [workOrders]);


    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, };
    const pieChartOptions = { ...chartOptions, plugins: { legend: { position: 'right' as const } }};
    const lineChartOptions = { ...chartOptions, scales: { y: { beginAtZero: true } }}; // Ensure Y axis starts at 0 for line/bar


    // --- Render Component ---
    return (
        <div className="dashboard-page">
            <h1>Dashboard Overview</h1>

            <section className="kpi-grid">
                {/* Row 1: Overall Status */}
                <div className={`kpi-card ${kpis.onlineAssets === kpis.totalAssets ? 'good' : ''}`}><span className="kpi-card-value">{kpis.onlineAssets} / {kpis.totalAssets}</span><span className="kpi-card-label">Assets Online</span></div>
                <div className={`kpi-card ${kpis.offlineUnplannedAssets > 0 ? 'critical' : kpis.offlineAssets > 0 ? 'warning' : ''}`}><span className="kpi-card-value">{kpis.offlineAssets}</span><span className="kpi-card-label">Assets Offline</span></div>
                 <div className={`kpi-card ${kpis.totalOpenWOs > 10 ? 'warning' : ''}`}><span className="kpi-card-value">{kpis.totalOpenWOs}</span><span className="kpi-card-label">Open WOs</span></div>
                 <div className={`kpi-card ${kpis.overdueWOs > 0 ? 'critical' : ''}`}><span className="kpi-card-value">{kpis.overdueWOs}</span><span className="kpi-card-label">Overdue WOs</span></div>
                {/* Row 2: Performance/Focus */}
                 <div className={`kpi-card ${kpis.criticalOpenWOs > 0 ? 'critical' : ''}`}><span className="kpi-card-value">{kpis.criticalOpenWOs}</span><span className="kpi-card-label">Critical Open WOs</span></div>
                 <div className={`kpi-card ${kpis.pmCompliance !== '100%' && kpis.pmCompliance !== 'N/A' ? 'warning' : 'good'}`}><span className="kpi-card-value">{kpis.pmCompliance}</span><span className="kpi-card-label">PM Compliance (30d)</span></div>
                 <div className="kpi-card"><span className="kpi-card-value">{kpis.reactiveRatio}</span><span className="kpi-card-label">Reactive WOs (30d Comp.)</span></div>
                 <div className="kpi-card"><span className="kpi-card-value">${kpis.totalCostLast30d}</span><span className="kpi-card-label">Est. Maint. Cost (30d Comp.)</span></div>
                 {/* Row 3: Tools/Other */}
                 <div className={`kpi-card ${kpis.pendingBookings > 0 ? 'warning' : ''}`}><span className="kpi-card-value">{kpis.pendingBookings}</span><span className="kpi-card-label">Pending Bookings</span></div>
                 <div className="kpi-card"><span className="kpi-card-value">{kpis.approvedBookingsToday}</span><span className="kpi-card-label">Bookings Today</span></div>
                 {/* Add more KPIs as needed */}
            </section>

             <section className="dashboard-charts-grid">
                 {/* WO Created vs Completed Trend */}
                 {woTrendData?.labels?.length > 0 ? (
                     <div className="chart-container">
                         <h3>WO Trend (Created vs Completed - Weekly)</h3>
                         <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                            <Line options={lineChartOptions} data={woTrendData} />
                         </div>
                     </div>
                 ) : <div className="chart-container"><p>Not enough data for WO Trend chart.</p></div> }

                 {/* Open WOs by Priority */}
                  {woPriorityData?.labels?.length > 0 ? (
                     <div className="chart-container">
                         <h3>Open Work Orders by Priority</h3>
                         <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                            <Pie options={pieChartOptions} data={woPriorityData} />
                         </div>
                     </div>
                 ) : <div className="chart-container"><p>No Open WO Priority data.</p></div> }

                 {/* Asset Status Chart */}
                  {assetStatusData?.labels?.length > 0 ? (
                      <div className="chart-container">
                         <h3>Asset Status</h3>
                          <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                            <Doughnut options={pieChartOptions} data={assetStatusData} />
                         </div>
                     </div>
                 ) : <div className="chart-container"><p>No Asset Status data.</p></div> }

                 {/* WO Type Distribution */}
                 {woTypeData?.labels?.length > 0 ? (
                     <div className="chart-container">
                         <h3>Work Order Type Distribution</h3>
                         <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                             <Pie options={pieChartOptions} data={woTypeData} />
                         </div>
                     </div>
                 ) : <div className="chart-container"><p>No WO Type data.</p></div> }

                 {/* Placeholder for Cost/Downtime Charts */}
                  {/* <div className="chart-container"><h3>Cost Trend (Placeholder)</h3></div> */}
                  {/* <div className="chart-container"><h3>Top Assets by Downtime (Placeholder)</h3></div> */}
             </section>
        </div>
    );
}

export default DashboardPage;