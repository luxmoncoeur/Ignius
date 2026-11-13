import PageHeader, { Page } from "@/components/PageHeader";
import { thermalAt } from "@/lib/thermal";

export const metadata = {
  title: "Proponents",
  description: "The team behind Ignius, the Temperature and Heat learning site.",
};

// "Surname, Given names M.I." — kept in the class-list order
const MEMBERS = [
  "Lat, Gio Angelo L.",
  "Lat, Pauline Mae R.",
  "Llanes, Stephen Lawrence B.",
  "Martinez, Jordan G.",
  "Martinez, Prince Rupert T.",
  "Melendres, Lee Andrei V.",
  "Molina, Ma. Guillena B.",
  "Ocampo, Marco R.",
  "Ongy, Christian Benedict R.",
  "Palmero, Jerome L.",
  "Pesa, Jonadab A.",
  "Posadas, Arvin John J.",
  "Raboy, Liam Paul S.",
  "Rizaldo, Gabriel Rudolf G.",
  "Salazar, Catherine Joy P.",
  "Udani, Gwyneth Crystal Anne M.",
  "Villanueva, Julien John G.",
].map((full) => {
  const [surname, given] = full.split(", ");
  return { full, surname, given, initials: given[0] + surname[0] };
});

export default function ProponentsPage() {
  return (
    <Page>
      <PageHeader
        crumbs={[{ href: "/learn", label: "Home" }, { label: "Proponents" }]}
        title="The team behind Ignius"
        sub={`${MEMBERS.length} students built these lessons, simulations, and quizzes for the CALPHY Finals unit on Temperature and Heat.`}
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MEMBERS.map((member, i) => (
          <li key={member.full} className="flex items-center gap-3 rounded-2xl bg-surface p-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-full text-base font-bold text-[#0b1220]"
              style={{ background: thermalAt(i / (MEMBERS.length - 1)) }}
              aria-hidden="true"
            >
              {member.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold text-ink">{member.surname}</span>
              <span className="block truncate text-sm text-ink-soft">{member.given}</span>
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
