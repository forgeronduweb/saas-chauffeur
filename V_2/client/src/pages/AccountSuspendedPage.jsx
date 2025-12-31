import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldX, Mail, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

const AccountSuspendedPage = () => {
  const [reason, setReason] = useState('')

  useEffect(() => {
    const suspendedReason = localStorage.getItem('accountSuspendedReason')
    if (suspendedReason) {
      setReason(suspendedReason)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Compte suspendu</CardTitle>
          <CardDescription>
            Votre compte a été temporairement suspendu par un administrateur.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{reason}</p>
            </div>
          )}

          <div className="space-y-2">
            <a 
              href="mailto:support@godriver.ci" 
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contacter le support
            </a>

            <Link 
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-gray-500 text-center">
            Contactez le support à{' '}
            <a href="mailto:support@godriver.ci" className="text-orange-500 hover:underline">
              support@godriver.ci
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AccountSuspendedPage
