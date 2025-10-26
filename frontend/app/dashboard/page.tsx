"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowUpRight, ArrowDownLeft, Zap, Users, Coins, TrendingUp } from "lucide-react"

const taskData = [
  { name: "Jan", tasks: 4, rewards: 2400 },
  { name: "Feb", tasks: 3, rewards: 1398 },
  { name: "Mar", tasks: 2, rewards: 9800 },
  { name: "Apr", tasks: 5, rewards: 3908 },
  { name: "May", tasks: 4, rewards: 4800 },
  { name: "Jun", tasks: 6, rewards: 3800 },
]

const rewardDistribution = [
  { name: "AI Agents", value: 45, color: "#0ea5e9" },
  { name: "Human Contributors", value: 55, color: "#a78bfa" },
]

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your protocol overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Active Tasks</p>
          <p className="text-2xl font-bold">24</p>
        </Card>

        <Card className="p-6 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 8%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Contributors</p>
          <p className="text-2xl font-bold">156</p>
        </Card>

        <Card className="p-6 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs text-red-500 flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" /> 3%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
          <p className="text-2xl font-bold">45.2K PTK</p>
        </Card>

        <Card className="p-6 border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 24%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Avg Reward/Task</p>
          <p className="text-2xl font-bold">1.88K</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6 border-border/40">
          <h3 className="font-semibold mb-6">Task & Reward Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="tasks" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="rewards" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-border/40">
          <h3 className="font-semibold mb-6">Reward Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rewardDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {rewardDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {rewardDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 border-border/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Recent Tasks</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Task ID</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Contributors</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Reward</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "#1001", desc: "AI Model Optimization", contrib: 3, reward: "2.5K PARAM", status: "Completed" },
                { id: "#1002", desc: "Data Analysis Task", contrib: 2, reward: "1.8K PARAM", status: "In Progress" },
                { id: "#1003", desc: "Research Collaboration", contrib: 5, reward: "3.2K PARAM", status: "Pending" },
                { id: "#1004", desc: "Integration Testing", contrib: 2, reward: "1.5K PARAM", status: "Completed" },
              ].map((task, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-card/50 transition">
                  <td className="py-3 px-4 font-mono text-primary">{task.id}</td>
                  <td className="py-3 px-4">{task.desc}</td>
                  <td className="py-3 px-4">{task.contrib}</td>
                  <td className="py-3 px-4 font-semibold">{task.reward}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === "Completed"
                          ? "bg-green-500/20 text-green-400"
                          : task.status === "In Progress"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
