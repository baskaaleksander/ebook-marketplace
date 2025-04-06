import { Payout } from "@/lib/definitions";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

function PayoutsTable({ payouts }: { payouts: Payout[] }) {

    return (
        <>
            <Table>
                <TableCaption>All your payouts</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                            <TableCell>{payout.amount}</TableCell>
                            <TableCell>{payout.status}</TableCell>
                            <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default PayoutsTable;