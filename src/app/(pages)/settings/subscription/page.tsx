import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const page = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Upgrade to Pro</h1>
        <div className="text-right">
          <div className="text-3xl font-bold">$8<span className="text-base font-normal text-muted-foreground">/month</span></div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Access to All Models */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-pink-500">🚀</span>
              Access to All Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get access to our full suite of models including Claude, o3-mini-high, and more!
            </CardDescription>
          </CardContent>
        </Card>

        {/* Generous Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-purple-500">✨</span>
              Generous Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Receive <strong>1500 standard credits</strong> per month, plus <strong>100 premium credits</strong>* per month.
            </CardDescription>
          </CardContent>
        </Card>

        {/* Priority Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-red-500">🎧</span>
              Priority Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get faster responses and dedicated assistance from the T3 team whenever you need help!
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Button */}
      <div className="flex justify-start">
        <Button variant="t3" size="lg" className="px-8">
          Upgrade Now
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="text-sm text-muted-foreground">
        * Premium credits are used for GPT Image Gen, Claude Sonnet, and Grok 3. Additional Premium credits can be purchased separately.
      </div>

      {/* Danger Zone */}
      <div className="mt-16 space-y-4">
        <h2 className="text-2xl font-bold">Danger Zone</h2>
        <p className="text-muted-foreground">
          Permanently delete your account and all associated data.
        </p>
        <Button variant="destructive" size="default">
          Delete Account
        </Button>
      </div>
    </div>
  )
}

export default page