import { Balance } from "@/lib/definitions";

function UserBalance( { balance } : { balance: Balance}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Available Balance</h2>
                <p>{balance.available.amount / 100} {balance.available.currency}</p>
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Pending Balance</h2>
                <p>{balance.pending.amount / 100} {balance.pending.currency}</p>
            </div>
        </div>
    );
}

export default UserBalance;