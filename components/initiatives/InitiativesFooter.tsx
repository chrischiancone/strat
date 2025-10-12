import { getDashboardMessage } from '@/app/actions/dashboard-messages'

export async function InitiativesFooter() {
  const footerMessage = await getDashboardMessage('initiatives_footer')

  if (!footerMessage) {
    return null
  }

  const colorClasses = {
    green: {
      wrapper: 'bg-green-50',
      heading: 'text-green-800',
      message: 'text-green-700'
    },
    yellow: {
      wrapper: 'bg-yellow-50',
      heading: 'text-yellow-800', 
      message: 'text-yellow-700'
    },
    blue: {
      wrapper: 'bg-blue-50',
      heading: 'text-blue-800',
      message: 'text-blue-700'
    }
  }

  const colors = colorClasses[footerMessage.bg_color] || colorClasses.green

  return (
    <div
      className={`flex items-center justify-between border-t border-gray-200 ${colors.wrapper} px-8 py-3`}
    >
      <div>
        <h3 className={`text-sm font-medium ${colors.heading}`}>
          {footerMessage.heading}
        </h3>
        <div className={`mt-1 text-sm ${colors.message}`}>
          {footerMessage.message}
        </div>
      </div>
    </div>
  )
}