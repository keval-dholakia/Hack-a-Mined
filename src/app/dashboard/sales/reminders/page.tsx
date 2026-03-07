import { getReminderLogs } from '@/app/actions/reminders'
import ReminderLogList from '@/components/modules/sales/ReminderLogList'

export default async function RemindersPage() {
  const logs = await getReminderLogs({ limit: 200 })
  return <ReminderLogList logs={logs} />
}