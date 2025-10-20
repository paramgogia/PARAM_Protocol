"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TasksPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>
            <p className="text-muted-foreground">Manage and track all your protocol tasks</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-10" />
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: "#1001", title: "AI Model Optimization", contributors: 3, reward: "2.5K PARAM", status: "Completed" },
          { id: "#1002", title: "Data Analysis Task", contributors: 2, reward: "1.8K PARAM", status: "In Progress" },
          { id: "#1003", title: "Research Collaboration", contributors: 5, reward: "3.2K PARAM", status: "Pending" },
          { id: "#1004", title: "Integration Testing", contributors: 2, reward: "1.5K PARAM", status: "Completed" },
          { id: "#1005", title: "Documentation Review", contributors: 1, reward: "0.8K PARAM", status: "In Progress" },
          { id: "#1006", title: "Security Audit", contributors: 4, reward: "4.0K PARAM", status: "Pending" },
        ].map((task, i) => (
          <Card key={i} className="p-6 border-border/40 hover:border-primary/40 transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">{task.id}</p>
                <h3 className="font-semibold">{task.title}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  task.status === "Completed"
                    ? "bg-green-500/20 text-green-400"
                    : task.status === "In Progress"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {task.status}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contributors</span>
                <span className="font-semibold">{task.contributors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reward</span>
                <span className="font-semibold text-primary">{task.reward}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
              View Details
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
