import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Coffee,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquareText,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import {
  deleteAdminRecord,
  getAdminDashboard,
  saveEvent,
  saveProduct,
  updateRecordStatus,
} from "@/lib/admin-api";
import { adminAuth, getAdminToken } from "@/lib/admin-auth";
import { TonaLogo } from "@/components/site/TonaLogo";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Tona Admin Dashboard" }] }),
});

type Row = Record<string, unknown>;
type DashboardData = {
  admin: { email: string; name: string; role: string };
  products: Row[];
  events: Row[];
  registrations: Row[];
  orders: Row[];
  businessInquiries: Row[];
  contactRequests: Row[];
};

const navItems = [
  ["overview", "Overview", LayoutDashboard],
  ["products", "Products", Coffee],
  ["events", "Events", CalendarDays],
  ["registrations", "Registrations", Users],
  ["orders", "Orders", PackageCheck],
  ["business", "Business inquiries", ClipboardList],
  ["contacts", "Contact requests", MessageSquareText],
] as const;

type View = (typeof navItems)[number][0];

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [view, setView] = useState<View>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Row | "new" | null>(
    null,
  );
  const [editingEvent, setEditingEvent] = useState<Row | "new" | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const token = await getAdminToken();
      const result = await getAdminDashboard({ data: { token } });
      setData(result as DashboardData);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to load the dashboard.";
      setError(message);
      if (/session|sign in|token/i.test(message))
        await navigate({ to: "/admin/login" });
    } finally {
      setBusy(false);
    }
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data || !query.trim()) return data;
    const needle = query.toLowerCase();
    const filter = (rows: Row[]) =>
      rows.filter((row) =>
        Object.values(row).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(needle),
        ),
      );
    return {
      ...data,
      products: filter(data.products),
      events: filter(data.events),
      registrations: filter(data.registrations),
      orders: filter(data.orders),
      businessInquiries: filter(data.businessInquiries),
      contactRequests: filter(data.contactRequests),
    };
  }, [data, query]);

  async function signOut() {
    await adminAuth.adapter.signOut();
    await navigate({ to: "/admin/login" });
  }

  async function changeStatus(
    entity:
      | "orders"
      | "event_registrations"
      | "business_inquiries"
      | "contact_requests",
    id: string,
    status: string,
  ) {
    try {
      const token = await getAdminToken();
      await updateRecordStatus({ data: { token, entity, id, status } });
      toast.success("Status updated.");
      await load();
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Could not update status.",
      );
    }
  }

  async function removeRecord(entity: DeleteEntity, id: string, label: string) {
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`))
      return;
    try {
      const token = await getAdminToken();
      await deleteAdminRecord({ data: { token, entity, id } });
      toast.success(`${label} deleted.`);
      await load();
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : `Could not delete ${label}.`,
      );
    }
  }

  if (busy && !data)
    return (
      <FullPageState
        icon={<LoaderCircle className="h-8 w-8 animate-spin" />}
        title="Loading Tona operations…"
      />
    );
  if (error && !data)
    return (
      <FullPageState
        icon={<Inbox className="h-8 w-8" />}
        title="Dashboard unavailable"
        description={error}
        action={
          <button
            onClick={load}
            className="rounded-xl bg-primary px-5 py-3 font-bold text-white"
          >
            Try again
          </button>
        }
      />
    );
  if (!data || !filtered) return null;

  const activeLabel = navItems.find(([id]) => id === view)?.[1] ?? "Overview";

  return (
    <div className="min-h-screen bg-sand text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={`${mobileNav ? "flex" : "hidden"} leaf-field fixed inset-0 z-50 flex-col border-r border-white/10 bg-teal-deep text-white lg:sticky lg:top-0 lg:flex lg:h-screen`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <a href="/" aria-label="Tona Coffee website">
            <TonaLogo tone="light" />
          </a>
          <button
            onClick={() => setMobileNav(false)}
            className="rounded-lg p-2 lg:hidden"
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Admin navigation"
        >
          {navItems.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setView(id);
                setMobileNav(false);
              }}
              className={`flex w-full items-center gap-3 rounded-md border-l-4 px-4 py-3 text-left text-sm font-bold uppercase tracking-[.04em] transition ${view === id ? "border-primary bg-primary text-white" : "border-transparent text-white/65 hover:border-primary hover:bg-white/8 hover:text-white"}`}
            >
              <Icon className="h-5 w-5" />
              {label}
              {id !== "overview" && (
                <span
                  className={`ml-auto rounded-sm px-2 py-0.5 text-xs ${view === id ? "bg-black/20 text-white" : "bg-white/10"}`}
                >
                  {countFor(id, data)}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 border-l-4 border-primary bg-white/7 p-3">
            <p className="truncate text-sm font-semibold">{data.admin.name}</p>
            <p className="truncate text-xs text-white/55">{data.admin.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wide text-white/65 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b-4 border-primary bg-teal-deep px-4 text-white sm:px-7 lg:px-10">
          <button
            onClick={() => setMobileNav(true)}
            className="rounded-md border border-white/20 bg-white/10 p-2.5 text-white lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="label-mono text-primary">Tona operations</p>
            <h1 className="truncate text-3xl font-black uppercase text-white">
              {activeLabel}
            </h1>
          </div>
          <label className="relative hidden w-full max-w-xs sm:block">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Search dashboard</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search records…"
              className="h-10 w-full rounded-md border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-primary"
            />
          </label>
          <button
            onClick={load}
            disabled={busy}
            className="rounded-md border border-white/20 bg-white/10 p-2.5 text-white hover:border-primary hover:text-primary"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`h-5 w-5 ${busy ? "animate-spin" : ""}`} />
          </button>
        </header>

        <div className="p-4 sm:p-7 lg:p-10">
          <div className="mb-5 sm:hidden">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search records…"
              className="h-11 w-full rounded-md border bg-white px-4 text-sm"
            />
          </div>
          {view === "overview" && <Overview data={data} go={setView} />}
          {view === "products" && (
            <Products
              rows={filtered.products}
              onEdit={setEditingProduct}
              onDelete={(row) =>
                removeRecord("products", String(row.id), String(row.name))
              }
            />
          )}
          {view === "events" && (
            <Events
              rows={filtered.events}
              onEdit={setEditingEvent}
              onDelete={(row) =>
                removeRecord("events", String(row.id), String(row.title))
              }
            />
          )}
          {view === "registrations" && (
            <Registrations
              rows={filtered.registrations}
              onStatus={changeStatus}
              onDelete={(row) =>
                removeRecord(
                  "event_registrations",
                  String(row.id),
                  `registration for ${String(row.full_name)}`,
                )
              }
            />
          )}
          {view === "orders" && (
            <Orders
              rows={filtered.orders}
              onStatus={changeStatus}
              onDelete={(row) =>
                removeRecord("orders", String(row.id), String(row.order_number))
              }
            />
          )}
          {view === "business" && (
            <Business
              rows={filtered.businessInquiries}
              onStatus={changeStatus}
              onDelete={(row) =>
                removeRecord(
                  "business_inquiries",
                  String(row.id),
                  String(row.organization),
                )
              }
            />
          )}
          {view === "contacts" && (
            <Contacts
              rows={filtered.contactRequests}
              onStatus={changeStatus}
              onDelete={(row) =>
                removeRecord(
                  "contact_requests",
                  String(row.id),
                  `request from ${String(row.full_name)}`,
                )
              }
            />
          )}
        </div>
      </main>

      {editingProduct && (
        <ProductEditor
          row={editingProduct}
          close={() => setEditingProduct(null)}
          saved={async () => {
            setEditingProduct(null);
            await load();
          }}
        />
      )}
      {editingEvent && (
        <EventEditor
          row={editingEvent}
          close={() => setEditingEvent(null)}
          saved={async () => {
            setEditingEvent(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function Overview({
  data,
  go,
}: {
  data: DashboardData;
  go: (view: View) => void;
}) {
  const stats = [
    [
      "New orders",
      data.orders.filter((row) => row.status === "new").length,
      "orders",
      PackageCheck,
      "bg-orange-50 text-primary",
    ],
    [
      "Upcoming events",
      data.events.filter(
        (row) =>
          new Date(String(row.event_date)) >= new Date() &&
          row.status === "published",
      ).length,
      "events",
      CalendarDays,
      "bg-teal/10 text-teal",
    ],
    [
      "Registrations",
      data.registrations.length,
      "registrations",
      Users,
      "bg-amber-50 text-amber-700",
    ],
    [
      "Open inquiries",
      data.businessInquiries.filter(
        (row) => !["closed", "declined"].includes(String(row.status)),
      ).length,
      "business",
      ClipboardList,
      "bg-blue-50 text-blue-700",
    ],
  ] as const;
  const activity = [
    ...data.orders.map((row) => ({
      type: "Order",
      title: String(row.customer_name),
      detail: String(row.order_number),
      date: row.created_at,
      view: "orders" as View,
    })),
    ...data.registrations.map((row) => ({
      type: "Registration",
      title: String(row.full_name),
      detail: String(row.event_title),
      date: row.created_at,
      view: "registrations" as View,
    })),
    ...data.businessInquiries.map((row) => ({
      type: "Business",
      title: String(row.organization),
      detail: String(row.contact_person),
      date: row.created_at,
      view: "business" as View,
    })),
  ]
    .sort((a, b) => +new Date(String(b.date)) - +new Date(String(a.date)))
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground">
          A live view of the work that needs attention today.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, target, Icon, color]) => (
          <button
            key={label}
            onClick={() => go(target)}
            className="group border border-border border-t-4 border-t-primary bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`mb-5 flex h-11 w-11 items-center justify-center rounded-md ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-teal">{value}</p>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>{label}</span>
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
      <section className="overflow-hidden border bg-white shadow-sm">
        <div className="border-b-4 border-primary bg-teal-deep px-5 py-4">
          <h2 className="text-2xl font-black uppercase text-white">
            Recent activity
          </h2>
        </div>
        {activity.length ? (
          <div className="divide-y">
            {activity.map((item, index) => (
              <button
                key={`${item.type}-${index}`}
                onClick={() => go(item.view)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-muted/40"
              >
                <span className="rounded-sm border-l-4 border-primary bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                  {item.type}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-teal">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.detail}
                  </span>
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {formatDate(item.date)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <Empty text="Activity will appear here as customers interact with the website." />
        )}
      </section>
    </div>
  );
}

function Products({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row | "new") => void;
  onDelete: (row: Row) => void;
}) {
  return (
    <Section
      title="Coffee catalogue"
      description="Control what customers see and which coffees are available."
      action={
        <button
          onClick={() => onEdit("new")}
          className="brand-button flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      }
    >
      <CardGrid>
        {rows.map((row) => (
          <article
            key={String(row.id)}
            className="overflow-hidden border border-border bg-white shadow-sm transition hover:border-primary"
          >
            <div className="aspect-[2/1] bg-teal/10">
              {row.image_url ? (
                <img
                  src={String(row.image_url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Coffee className="h-10 w-10 text-teal/35" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label-mono text-primary">
                    {String(row.process)}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-teal">
                    {String(row.name)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {String(row.region)} · {String(row.variant_count)} variants
                  </p>
                </div>
                <Status value={String(row.status)} />
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span
                  className={`text-xs font-semibold ${row.is_available ? "text-emerald-700" : "text-muted-foreground"}`}
                >
                  {row.is_available ? "Available" : "Unavailable"}
                </span>
                <div className="flex items-center gap-2">
                  <DeleteButton
                    label={`Delete ${String(row.name)}`}
                    action={() => onDelete(row)}
                  />
                  <button
                    onClick={() => onEdit(row)}
                    className="rounded-md border px-4 py-2 text-sm font-bold uppercase tracking-wide text-teal hover:border-primary hover:text-primary"
                  >
                    Edit coffee
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </CardGrid>
    </Section>
  );
}

function Events({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row | "new") => void;
  onDelete: (row: Row) => void;
}) {
  return (
    <Section
      title="Events"
      description="Publish experiences and manage registration availability."
      action={
        <button
          onClick={() => onEdit("new")}
          className="brand-button flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> New event
        </button>
      }
    >
      <div className="space-y-3">
        {rows.map((row) => (
          <article
            key={String(row.id)}
            className="flex flex-col gap-4 border border-border border-l-4 border-l-primary bg-white p-5 shadow-sm md:flex-row md:items-center"
          >
            <div className="leaf-field flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-teal text-white">
              <span className="text-xl font-bold">
                {new Date(String(row.event_date)).getDate()}
              </span>
              <span className="text-[10px] uppercase">
                {new Date(String(row.event_date)).toLocaleDateString("en", {
                  month: "short",
                })}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-teal">
                  {String(row.title)}
                </h3>
                <Status value={String(row.status)} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(row.event_date)} · {String(row.location)} ·{" "}
                {String(row.registration_count)} registrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DeleteButton
                label={`Delete ${String(row.title)}`}
                action={() => onDelete(row)}
              />
              <button
                onClick={() => onEdit(row)}
                className="rounded-md border px-4 py-2 text-sm font-bold uppercase tracking-wide text-teal hover:border-primary"
              >
                Edit event
              </button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Registrations({
  rows,
  onStatus,
  onDelete,
}: {
  rows: Row[];
  onStatus: StatusHandler;
  onDelete: (row: Row) => void;
}) {
  return (
    <Section
      title="Event registrations"
      description="Confirm attendance and keep an accurate guest list."
    >
      <RecordTable
        headers={["Guest", "Event", "Guests", "Date", "Status", "Actions"]}
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-t">
            <Cell
              title={String(row.full_name)}
              subtitle={`${String(row.phone)}${row.email ? ` · ${row.email}` : ""}`}
            />
            <Cell title={String(row.event_title)} />
            <Cell title={String(row.guest_count)} />
            <Cell title={formatDate(row.created_at)} />
            <td className="p-4">
              <StatusSelect
                value={String(row.status)}
                options={["new", "confirmed", "attended", "cancelled"]}
                change={(status) =>
                  onStatus("event_registrations", String(row.id), status)
                }
              />
            </td>
            <td className="p-4">
              <DeleteButton
                label={`Delete registration for ${String(row.full_name)}`}
                action={() => onDelete(row)}
              />
            </td>
          </tr>
        ))}
      </RecordTable>
    </Section>
  );
}

function Orders({
  rows,
  onStatus,
  onDelete,
}: {
  rows: Row[];
  onStatus: StatusHandler;
  onDelete: (row: Row) => void;
}) {
  return (
    <Section
      title="Orders"
      description="Track every customer order from request to completion."
    >
      <RecordTable
        headers={["Order", "Customer", "Items", "Total", "Status", "Actions"]}
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-t">
            <Cell
              title={String(row.order_number)}
              subtitle={formatDate(row.created_at)}
            />
            <Cell
              title={String(row.customer_name)}
              subtitle={String(row.phone)}
            />
            <Cell
              title={`${Array.isArray(row.items) ? row.items.length : 0} item(s)`}
            />
            <Cell
              title={row.total_amount ? `${row.total_amount} ETB` : "Pending"}
            />
            <td className="p-4">
              <StatusSelect
                value={String(row.status)}
                options={[
                  "new",
                  "confirmed",
                  "processing",
                  "completed",
                  "cancelled",
                ]}
                change={(status) => onStatus("orders", String(row.id), status)}
              />
            </td>
            <td className="p-4">
              <DeleteButton
                label={`Delete ${String(row.order_number)}`}
                action={() => onDelete(row)}
              />
            </td>
          </tr>
        ))}
      </RecordTable>
    </Section>
  );
}

function Business({
  rows,
  onStatus,
  onDelete,
}: {
  rows: Row[];
  onStatus: StatusHandler;
  onDelete: (row: Row) => void;
}) {
  return (
    <Section
      title="Business inquiries"
      description="Follow wholesale, hospitality and export opportunities."
    >
      <RecordTable
        headers={[
          "Organization",
          "Contact",
          "Interest",
          "Received",
          "Status",
          "Actions",
        ]}
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-t">
            <Cell
              title={String(row.organization)}
              subtitle={String(row.business_type ?? "Business")}
            />
            <Cell
              title={String(row.contact_person)}
              subtitle={String(row.phone)}
            />
            <Cell
              title={String(row.coffee_interest ?? "Not specified")}
              subtitle={String(row.estimated_quantity ?? "")}
            />
            <Cell title={formatDate(row.created_at)} />
            <td className="p-4">
              <StatusSelect
                value={String(row.status)}
                options={["new", "contacted", "qualified", "closed", "lost"]}
                change={(status) =>
                  onStatus("business_inquiries", String(row.id), status)
                }
              />
            </td>
            <td className="p-4">
              <DeleteButton
                label={`Delete ${String(row.organization)}`}
                action={() => onDelete(row)}
              />
            </td>
          </tr>
        ))}
      </RecordTable>
    </Section>
  );
}

function Contacts({
  rows,
  onStatus,
  onDelete,
}: {
  rows: Row[];
  onStatus: StatusHandler;
  onDelete: (row: Row) => void;
}) {
  return (
    <Section
      title="Contact requests"
      description="Keep customer questions and feedback moving."
    >
      <RecordTable
        headers={[
          "Customer",
          "Request",
          "Message",
          "Received",
          "Status",
          "Actions",
        ]}
      >
        {rows.map((row) => (
          <tr key={String(row.id)} className="border-t">
            <Cell title={String(row.full_name)} subtitle={String(row.phone)} />
            <Cell title={String(row.request_type).replaceAll("_", " ")} />
            <Cell title={String(row.message)} />
            <Cell title={formatDate(row.created_at)} />
            <td className="p-4">
              <StatusSelect
                value={String(row.status)}
                options={["new", "in_progress", "resolved", "spam"]}
                change={(status) =>
                  onStatus("contact_requests", String(row.id), status)
                }
              />
            </td>
            <td className="p-4">
              <DeleteButton
                label={`Delete request from ${String(row.full_name)}`}
                action={() => onDelete(row)}
              />
            </td>
          </tr>
        ))}
      </RecordTable>
    </Section>
  );
}

type StatusHandler = (
  entity:
    | "orders"
    | "event_registrations"
    | "business_inquiries"
    | "contact_requests",
  id: string,
  status: string,
) => Promise<void>;

type DeleteEntity =
  | "products"
  | "events"
  | "orders"
  | "event_registrations"
  | "business_inquiries"
  | "contact_requests";

function ProductEditor({
  row,
  close,
  saved,
}: {
  row: Row | "new";
  close: () => void;
  saved: () => Promise<void>;
}) {
  const product = row === "new" ? {} : row;
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const token = await getAdminToken();
      await saveProduct({
        data: {
          token,
          id: row === "new" ? undefined : String(product.id),
          name: String(form.get("name")),
          region: String(form.get("region")),
          process: String(form.get("process")),
          description: String(form.get("description")),
          tastingNotes: String(form.get("tastingNotes"))
            .split(",")
            .map((note) => note.trim())
            .filter(Boolean),
          altitude: nullable(form.get("altitude")),
          imageUrl: nullable(form.get("imageUrl")),
          status: String(form.get("status")) as
            "draft" | "published" | "archived",
          isAvailable: form.get("isAvailable") === "on",
          isFeatured: form.get("isFeatured") === "on",
        },
      });
      toast.success("Product saved.");
      await saved();
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Could not save product.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={row === "new" ? "Create product" : "Edit coffee"}
      close={close}
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <EditorField name="name" label="Name" value={product.name} required />
        <EditorField
          name="region"
          label="Region"
          value={product.region}
          required
        />
        <EditorField
          name="process"
          label="Process"
          value={product.process}
          required
        />
        <EditorField
          name="altitude"
          label="Altitude"
          value={product.altitude}
        />
        <EditorField
          name="tastingNotes"
          label="Tasting notes (comma separated)"
          value={
            Array.isArray(product.tasting_notes)
              ? product.tasting_notes.join(", ")
              : ""
          }
          className="sm:col-span-2"
        />
        <EditorField
          name="imageUrl"
          label="Image URL"
          value={product.image_url}
          className="sm:col-span-2"
        />
        <label className="sm:col-span-2 text-sm font-semibold text-teal">
          Description
          <textarea
            name="description"
            defaultValue={String(product.description ?? "")}
            rows={4}
            className="mt-2 w-full rounded-xl border p-3 font-normal outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm font-semibold text-teal">
          Publication
          <select
            name="status"
            defaultValue={String(product.status ?? "draft")}
            className="mt-2 h-11 w-full rounded-xl border bg-white px-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="flex flex-col justify-center gap-2">
          <CheckField
            name="isAvailable"
            label="Available to order"
            checked={
              product.is_available === undefined
                ? true
                : Boolean(product.is_available)
            }
          />
          <CheckField
            name="isFeatured"
            label="Featured coffee"
            checked={Boolean(product.is_featured)}
          />
        </div>
        <EditorActions
          busy={busy}
          close={close}
          submitLabel={row === "new" ? "Create product" : "Save changes"}
        />
      </form>
    </Modal>
  );
}

function EventEditor({
  row,
  close,
  saved,
}: {
  row: Row | "new";
  close: () => void;
  saved: () => Promise<void>;
}) {
  const event = row === "new" ? {} : row;
  const [busy, setBusy] = useState(false);
  async function submit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    const form = new FormData(submitEvent.currentTarget);
    setBusy(true);
    try {
      const token = await getAdminToken();
      const capacity = nullable(form.get("capacity"));
      await saveEvent({
        data: {
          token,
          id: row === "new" ? undefined : String(event.id),
          title: String(form.get("title")),
          summary: String(form.get("summary")),
          description: String(form.get("description")),
          eventDate: new Date(String(form.get("eventDate"))).toISOString(),
          location: String(form.get("location")),
          capacity: capacity ? Number(capacity) : null,
          coverImageUrl: nullable(form.get("coverImageUrl")),
          status: String(form.get("status")) as
            "draft" | "published" | "cancelled" | "completed",
          registrationOpen: form.get("registrationOpen") === "on",
        },
      });
      toast.success("Event saved.");
      await saved();
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Could not save event.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={row === "new" ? "Create event" : "Edit event"} close={close}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <EditorField
          name="title"
          label="Event title"
          value={event.title}
          required
          className="sm:col-span-2"
        />
        <EditorField
          name="eventDate"
          label="Date and time"
          type="datetime-local"
          value={toLocalDateTime(event.event_date)}
          required
        />
        <EditorField
          name="location"
          label="Location"
          value={event.location}
          required
        />
        <EditorField
          name="capacity"
          label="Capacity"
          type="number"
          value={event.capacity}
        />
        <EditorField
          name="coverImageUrl"
          label="Cover image URL"
          value={event.cover_image_url}
        />
        <EditorField
          name="summary"
          label="Short summary"
          value={event.summary}
          className="sm:col-span-2"
        />
        <label className="sm:col-span-2 text-sm font-semibold text-teal">
          Description
          <textarea
            name="description"
            defaultValue={String(event.description ?? "")}
            rows={4}
            className="mt-2 w-full rounded-xl border p-3 font-normal outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm font-semibold text-teal">
          Status
          <select
            name="status"
            defaultValue={String(event.status ?? "draft")}
            className="mt-2 h-11 w-full rounded-xl border bg-white px-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <div className="flex items-end pb-3">
          <CheckField
            name="registrationOpen"
            label="Registration open"
            checked={
              event.registration_open === undefined
                ? true
                : Boolean(event.registration_open)
            }
          />
        </div>
        <EditorActions
          busy={busy}
          close={close}
          submitLabel={row === "new" ? "Create event" : "Save changes"}
        />
      </form>
    </Modal>
  );
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-black uppercase text-teal">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}
function RecordTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="border-b-4 border-primary bg-teal-deep text-xs uppercase tracking-wider text-white/70">
            <tr>
              {headers.map((header) => (
                <th key={header} className="p-4 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
function Cell({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <td className="max-w-xs p-4">
      <p className="line-clamp-2 text-sm font-semibold text-teal">{title}</p>
      {subtitle && (
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {subtitle}
        </p>
      )}
    </td>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-sm border-l-2 border-current px-2.5 py-1 text-[11px] font-bold capitalize ${statusColor(value)}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
function StatusSelect({
  value,
  options,
  change,
}: {
  value: string;
  options: string[];
  change: (status: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => change(event.target.value)}
      className={`rounded-sm border-0 px-2.5 py-1.5 text-xs font-bold capitalize outline-none ring-1 ring-inset ring-black/5 ${statusColor(value)}`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">{text}</div>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-teal/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border bg-sand shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-4 border-primary bg-teal-deep px-6 py-5 text-white">
          <h2 className="text-3xl font-black uppercase text-white">{title}</h2>
          <button
            onClick={close}
            className="rounded-md border border-white/20 bg-white/10 p-2 text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function EditorField({
  label,
  value,
  className = "",
  ...props
}: {
  label: string;
  value?: unknown;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`text-sm font-semibold text-teal ${className}`}>
      {label}
      <input
        {...props}
        defaultValue={value == null ? "" : String(value)}
        className="mt-2 h-11 w-full rounded-md border bg-white px-3 font-normal outline-none focus:border-primary"
      />
    </label>
  );
}
function CheckField({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-teal">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}
function EditorActions({
  busy,
  close,
  submitLabel = "Save changes",
}: {
  busy: boolean;
  close: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t pt-5 sm:col-span-2">
      <button
        type="button"
        onClick={close}
        className="rounded-md border bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-teal"
      >
        Cancel
      </button>
      <button
        disabled={busy}
        className="brand-button bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

function DeleteButton({
  label,
  action,
}: {
  label: string;
  action: () => void;
}) {
  return (
    <button
      type="button"
      onClick={action}
      className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-2 text-red-700 hover:border-red-300 hover:bg-red-100"
      aria-label={label}
      title={label}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
function FullPageState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <main className="leaf-field flex min-h-screen items-center justify-center bg-sand p-5">
      <div className="max-w-md text-center">
        <div className="brand-shadow mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
          {icon}
        </div>
        <h1 className="text-3xl font-bold text-teal">{title}</h1>
        {description && (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </main>
  );
}

function countFor(view: View, data: DashboardData) {
  if (view === "products") return data.products.length;
  if (view === "events") return data.events.length;
  if (view === "registrations") return data.registrations.length;
  if (view === "orders") return data.orders.length;
  if (view === "business") return data.businessInquiries.length;
  if (view === "contacts") return data.contactRequests.length;
  return 0;
}
function statusColor(value: string) {
  if (
    ["published", "completed", "resolved", "attended", "qualified"].includes(
      value,
    )
  )
    return "bg-emerald-100 text-emerald-800";
  if (
    ["new", "confirmed", "processing", "contacted", "in_progress"].includes(
      value,
    )
  )
    return "bg-orange-100 text-orange-800";
  if (["cancelled", "declined", "archived", "closed"].includes(value))
    return "bg-slate-100 text-slate-600";
  return "bg-amber-100 text-amber-800";
}
function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-ET", { dateStyle: "medium", timeStyle: "short" });
}
function toLocalDateTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
function nullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}
