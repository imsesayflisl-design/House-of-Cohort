import { prisma } from "@/lib/prisma";
import { formatSLE } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DeliveryZoneDialog,
  EditDeliveryZoneButton,
} from "@/components/admin/DeliveryZoneDialog";
import { DeliveryZoneActiveToggle } from "@/components/admin/DeliveryZoneActiveToggle";

export default async function AdminDeliveryPage() {
  const zones = await prisma.deliveryZone.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-black">Delivery zones</h1>
          <p className="text-sm text-muted-foreground">
            {zones.length} {zones.length === 1 ? "zone" : "zones"}
          </p>
        </div>
        <DeliveryZoneDialog />
      </header>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No delivery zones yet.
                </TableCell>
              </TableRow>
            ) : (
              zones.map((z) => (
                <TableRow key={z.id}>
                  <TableCell className="font-medium">{z.name}</TableCell>
                  <TableCell>{formatSLE(z.fee)}</TableCell>
                  <TableCell>
                    <DeliveryZoneActiveToggle
                      zoneId={z.id}
                      isActive={z.isActive}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <EditDeliveryZoneButton
                      zone={{
                        id: z.id,
                        name: z.name,
                        fee: z.fee,
                        isActive: z.isActive,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
