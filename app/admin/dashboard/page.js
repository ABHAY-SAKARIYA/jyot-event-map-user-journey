
import { getMapRegistry } from "@/app/actions/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function DashboardPage() {
    // Fetch map registry server-side
    const registryResult = await getMapRegistry();
    const registry = registryResult.success ? registryResult.data : null;

    return (
        <AdminDashboardClient
            initialRegistry={registry}
        />
    );
}
