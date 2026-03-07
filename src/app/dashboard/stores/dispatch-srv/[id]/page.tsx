import { getDispatchSRVById, getProductsForSelect } from '@/app/actions/stores'
import DispatchSRVForm from '@/components/modules/stores/DispatchSRVForm'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit Dispatch SRV | TechMicra ERP' }

export default async function EditDispatchSRVPage({ params }: Props) {
    const { id } = await params
    const [srv, products] = await Promise.all([
        getDispatchSRVById(parseInt(id)),
        getProductsForSelect(),
    ])

    if (!srv) notFound()

    const srvForForm = {
        id: srv.id,
        srv_no: srv.srv_no,
        srv_date: srv.srv_date,
        party_name: srv.party_name ?? '',
        product_id: srv.product_id.toString(),
        qty: srv.qty.toString(),
        returnable: srv.returnable.toString(),
        return_by_date: srv.return_by_date ?? '',
        remarks: srv.remarks ?? '',
    }

    return <DispatchSRVForm products={products as any} srv={srvForForm} />
}
