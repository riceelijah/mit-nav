import type { Collection, Db } from "mongodb";

type Status = "OPEN" | "RESOLVED";

interface ReportDoc {
  _id: string;
  order: number;
  reporter: string;
  target: string;
  reason: string;
  status: Status;
}

type User = string;
type Target = string;

export class ReportingConcept {
  private readonly reports: Collection<ReportDoc>;

  constructor(db: Db) {
    this.reports = db.collection<ReportDoc>("reporting.reports");
  }

  async report({ reporter, target, reason }: { reporter: User; target: Target; reason: string }) {
    const report = crypto.randomUUID();
    const order = await this.reports.countDocuments({});
    await this.reports.insertOne({ _id: report, order, reporter, target, reason, status: "OPEN" });
    return { report };
  }

  async resolve({ target }: { target: Target }) {
    await this.reports.updateMany({ target, status: "OPEN" }, { $set: { status: "RESOLVED" } });
    return {};
  }

  async _open(_input: Record<string, never>) {
    const rows = await this.reports.find({ status: "OPEN" }).toArray();
    return rows
      .sort((a, b) => a.order - b.order)
      .map((r) => ({ report: r._id, reporter: r.reporter, target: r.target, reason: r.reason }));
  }

  async _about({ target }: { target: Target }) {
    const rows = await this.reports.find({ target }).toArray();
    return rows
      .sort((a, b) => a.order - b.order)
      .map((r) => ({ report: r._id, reporter: r.reporter, reason: r.reason, status: r.status }));
  }
}
