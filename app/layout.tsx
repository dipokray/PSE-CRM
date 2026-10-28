import './globals.css'
import Link from 'next/link'
export const metadata = { title: 'PSE CRM · JAAGO Foundation' }
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><nav><b>Private Sector Engagement</b>
    {[['/', 'Dashboard'], ['/contacts', 'Contacts'], ['/pipelines', 'Pipelines'], ['/meetings', 'Meetings'], ['/activities', 'Activities'], ['/targets', 'Targets']].map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</nav>
    <main>{children}</main></body></html>
}
