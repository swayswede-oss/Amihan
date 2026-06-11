import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function Analytics() {
  const weeklyData = [
    { day: 'Mon', distance: 1200, trips: 45 },
    { day: 'Tue', distance: 1400, trips: 52 },
    { day: 'Wed', distance: 1100, trips: 38 },
    { day: 'Thu', distance: 1600, trips: 58 },
    { day: 'Fri', distance: 1350, trips: 48 },
    { day: 'Sat', distance: 900, trips: 32 },
    { day: 'Sun', distance: 600, trips: 22 },
  ];

  const statusData = [
    { name: 'Active', value: 12, color: '#10b981' },
    { name: 'Idle', value: 5, color: '#f59e0b' },
    { name: 'Maintenance', value: 2, color: '#ef4444' },
    { name: 'Offline', value: 1, color: '#6b7280' },
  ];

  const fuelData = [
    { month: 'Jul', cost: 4200 },
    { month: 'Aug', cost: 4500 },
    { month: 'Sep', cost: 4100 },
    { month: 'Oct', cost: 4800 },
    { month: 'Nov', cost: 4600 },
    { month: 'Dec', cost: 5200 },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Analytics</h2>
        <p className="text-sm lg:text-base text-gray-600">Fleet performance insights and metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <p className="text-gray-600 text-xs lg:text-sm mb-1">Total Distance This Week</p>
          <p className="text-gray-900 text-2xl lg:text-3xl mb-2">5,070 mi</p>
          <p className="text-green-600 text-xs lg:text-sm">+12% from last week</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <p className="text-gray-600 text-xs lg:text-sm mb-1">Total Trips</p>
          <p className="text-gray-900 text-2xl lg:text-3xl mb-2">295</p>
          <p className="text-green-600 text-xs lg:text-sm">+8% from last week</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <p className="text-gray-600 text-xs lg:text-sm mb-1">Avg Fuel Efficiency</p>
          <p className="text-gray-900 text-2xl lg:text-3xl mb-2">18.8 mpg</p>
          <p className="text-red-600 text-xs lg:text-sm">-3% from last week</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Distance & Trips */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <h3 className="text-gray-900 mb-4">Weekly Distance & Trips</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="distance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <h3 className="text-gray-900 mb-4">Fleet Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                style={{ fontSize: '12px' }}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Costs */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 lg:col-span-2">
          <h3 className="text-gray-900 mb-4">Monthly Fuel Costs</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={fuelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}