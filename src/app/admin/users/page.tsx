import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DEMO_ACCOUNTS } from "@/config/demo-auth"
import { getInitials } from "@/lib/utils"
import type { UserRole } from "@/types"

const ROLE_GROUPS: { role: UserRole; title: string; description: string }[] = [
  { role: "customer", title: "Customers", description: "Customer personas for discovery, booking, favorites, and reviews." },
  { role: "owner", title: "Salon Owners / Representatives", description: "Owner personas for salon operations and verification workflows." },
  { role: "admin", title: "Admins", description: "Admin personas for moderation, users, salons, and platform review." },
]

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Demo Users</h1>
          <Badge variant="outline">Seed data</Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Personas available for judging. Production user management requires the planned auth migration.
        </p>
      </div>

      <div className="space-y-6">
        {ROLE_GROUPS.map((group) => {
          const accounts = DEMO_ACCOUNTS.filter((account) => account.user.role === group.role)
          return (
            <section key={group.role} className="space-y-3">
              <div>
                <h2 className="text-base font-semibold">{group.title}</h2>
                <p className="text-xs text-gray-500">{group.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.user.id}>
                    <CardHeader className="pb-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-sm font-semibold text-white">
                        {getInitials(account.user.full_name)}
                      </div>
                      <CardTitle className="text-base">{account.user.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-gray-500">{account.user.email}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="capitalize">{account.user.role}</Badge>
                        <Badge variant="outline">Active</Badge>
                        <Badge variant="secondary">Seed/demo data</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
