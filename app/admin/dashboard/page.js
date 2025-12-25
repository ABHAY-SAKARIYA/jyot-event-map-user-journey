
import { readData } from "@/app/actions/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function DashboardPage() {
    // Fetch data server-side
    const events = await readData("events.json");
    const routes = await readData("routes.json");
    const mapConfig = await readData("mapConfig.json");

    return (
        <AdminDashboardClient
            initialEvents={events || []}
            initialRoutes={routes || []}
            initialConfig={mapConfig || {}}
        />
    );
}
