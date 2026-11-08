import type { Metadata } from 'next';
export const metadata: Metadata={title:'Gulit',description:'Your everyday marketplace in Ethiopia.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
