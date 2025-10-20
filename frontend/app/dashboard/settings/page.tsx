"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your protocol settings and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account Settings */}
        <Card className="p-6 border-border/40">
          <h3 className="font-semibold mb-6">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Wallet Address</Label>
              <Input value="0x1234...5678" disabled className="bg-card/50" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Email</Label>
              <Input placeholder="your@email.com" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
          </div>
        </Card>

        {/* Protocol Settings */}
        <Card className="p-6 border-border/40">
          <h3 className="font-semibold mb-6">Protocol Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Reward Token</Label>
              <Input value="PARAM" disabled className="bg-card/50" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Commission Rate (%)</Label>
              <Input placeholder="0" type="number" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">Update Settings</Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-500/20 bg-red-500/5">
          <h3 className="font-semibold mb-4 text-red-400">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">Irreversible actions</p>
          <Button variant="destructive">Reset All Data</Button>
        </Card>
      </div>
    </div>
  )
}
