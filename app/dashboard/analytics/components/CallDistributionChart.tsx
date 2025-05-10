"use client"

import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts"

interface CallDistributionChartProps {
  view?: 'type' | 'outcome' | 'duration'
  days?: number
}

export function CallDistributionChart({ 
  view = 'type',
  days = 7 
}: CallDistributionChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308']

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let metricType: string;
        
        // Determine which metric to fetch based on view
        switch (view) {
          case 'type':
            metricType = 'CallTypeDistribution';
            break;
          case 'outcome':
            metricType = 'CallOutcomeDistribution';
            break;
          case 'duration':
            metricType = 'CallDurationDistribution';
            break;
          default:
            metricType = 'CallTypeDistribution';
        }
        
        // Fetch distribution data based on the prefix
        let prefix: string;
        
        switch (view) {
          case 'type':
            prefix = 'CallTypeDistribution_';
            break;
          case 'outcome':
            prefix = 'CallOutcomeDistribution_';
            break;
          case 'duration':
            prefix = 'CallDurationDistribution_';
            break;
          default:
            prefix = 'CallTypeDistribution_';
        }
        
        const response = await fetch(`/api/analytics?days=${days}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${view} distribution data`)
        }
        
        const responseData = await response.json()
        
        // Filter metrics by prefix and get the latest values
        const filteredData: Record<string, any[]> = {};
        
        Object.keys(responseData).forEach(key => {
          if (key.startsWith(prefix)) {
            filteredData[key] = responseData[key];
          }
        });
        
        if (Object.keys(filteredData).length > 0) {
          // Convert to array format for the chart
          const chartData = Object.keys(filteredData).map(key => {
            // Get the category name by removing the prefix
            const name = key.replace(prefix, '').replace(/([A-Z])/g, ' $1').trim();
            
            // Get the latest value
            const value = filteredData[key][filteredData[key].length - 1].value;
            
            return {
              name,
              value: Number(value)
            };
          });
          
          setData(chartData);
        } else {
          // Use sample data as fallback
          generateSampleData(view);
        }
      } catch (err) {
        console.error(`Error fetching ${view} distribution data:`, err)
        setError(`Failed to load ${view} distribution data`)
        
        // Use sample data as fallback
        generateSampleData(view);
      } finally {
        setLoading(false)
      }
    }

    const generateSampleData = (viewType: string) => {
      let sampleData: any[] = [];
      
      switch (viewType) {
        case 'type':
          sampleData = [
            { name: 'Support', value: 45 },
            { name: 'Sales', value: 25 },
            { name: 'Technical', value: 20 },
            { name: 'Billing', value: 10 }
          ];
          break;
        case 'outcome':
          sampleData = [
            { name: 'Resolved', value: 65 },
            { name: 'Escalated', value: 15 },
            { name: 'Follow-up', value: 12 },
            { name: 'Unresolved', value: 8 }
          ];
          break;
        case 'duration':
          sampleData = [
            { name: '< 5 min', value: 30 },
            { name: '5-10 min', value: 40 },
            { name: '10-15 min', value: 20 },
            { name: '> 15 min', value: 10 }
          ];
          break;
      }
      
      setData(sampleData);
    }

    fetchData()
  }, [view, days])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke="white"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value}%`, 'Percentage']}
          contentStyle={{ 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            fontSize: '12px'
          }}
        />
        <Legend 
          layout="vertical"
          verticalAlign="middle" 
          align="right"
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ 
            fontSize: '12px', 
            paddingLeft: '10px',
            lineHeight: '20px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}