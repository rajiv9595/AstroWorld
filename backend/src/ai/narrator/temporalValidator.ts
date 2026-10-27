import { TemporalWindowResult } from '../schemas/reasoningPacket.ts';
import { SanitizedTimingWindow } from '../schemas/narratorContext.ts';
import { TimingWindowCategory } from '../schemas/claimPacket.ts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export class TemporalSanityValidator {
  /**
   * Validates and converts raw temporal window results into sanitized, human-friendly timing windows.
   */
  public sanitizeWindows(windows: TemporalWindowResult[]): SanitizedTimingWindow[] {
    const sanitized: SanitizedTimingWindow[] = [];

    for (const w of windows) {
      const startIso = w.startDateIso || w.startIso;
      const endIso = w.endDateIso || w.endIso;

      if (!startIso || !endIso) continue;

      const startDate = new Date(startIso);
      const endDate = new Date(endIso);

      // 1. Check for invalid date parsing
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        continue;
      }

      // 2. Suppress zero-length or malformed windows (where start === end and duration is zero)
      if (startDate.getTime() === endDate.getTime()) {
        // Suppress placeholder single-day points like 2027-01-01 to 2027-01-01
        continue;
      }

      if (endDate.getTime() < startDate.getTime()) {
        // Inverted dates are invalid
        continue;
      }

      // 3. Determine specific windowCategory
      const windowCategory: TimingWindowCategory =
        w.label.toLowerCase().includes('dasha')
          ? 'dasha_cycle'
          : w.label.toLowerCase().includes('transit') || w.label.toLowerCase().includes('gochara')
          ? 'transit_period'
          : w.type === 'peak_confluence_window'
          ? 'confluence_window'
          : 'event_window';

      // 4. Format into natural human date range
      const periodText = this.formatDateRange(startDate, endDate);

      sanitized.push({
        id: w.id,
        label: this.cleanLabel(w.label),
        periodText,
        type: w.type,
        windowCategory,
        startIso,
        endIso,
      });
    }

    return sanitized;
  }

  /**
   * Computes the true mathematical temporal confluence (intersection) between Dasha and Transit windows.
   */
  public computeConfluenceWindow(windows: SanitizedTimingWindow[]): SanitizedTimingWindow | undefined {
    const dashaWin = windows.find(w => w.windowCategory === 'dasha_cycle' && w.startIso && w.endIso);
    const transitWin = windows.find(
      w => (w.windowCategory === 'transit_period' || w.windowCategory === 'confluence_window' || w.type === 'peak_confluence_window') &&
        w !== dashaWin &&
        w.startIso &&
        w.endIso
    );

    if (!dashaWin || !transitWin || !dashaWin.startIso || !dashaWin.endIso || !transitWin.startIso || !transitWin.endIso) {
      return undefined;
    }

    const dashaStart = new Date(dashaWin.startIso).getTime();
    const dashaEnd = new Date(dashaWin.endIso).getTime();
    const transitStart = new Date(transitWin.startIso).getTime();
    const transitEnd = new Date(transitWin.endIso).getTime();

    const confluenceStart = Math.max(dashaStart, transitStart);
    const confluenceEnd = Math.min(dashaEnd, transitEnd);

    if (confluenceStart >= confluenceEnd) {
      // No valid overlap
      return undefined;
    }

    const startDate = new Date(confluenceStart);
    const endDate = new Date(confluenceEnd);
    const periodText = this.formatDateRange(startDate, endDate);

    return {
      id: `win_confluence_${confluenceStart}_${confluenceEnd}`,
      label: `Peak Astrological Confluence (${dashaWin.label} + Transit)`,
      periodText,
      type: 'peak_confluence_window',
      windowCategory: 'confluence_window',
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
    };
  }

  /**
   * Formats two Dates into a clean, natural astrologer period description.
   */
  public formatDateRange(startDate: Date, endDate: Date): string {
    const startMonth = MONTH_NAMES[startDate.getUTCMonth()];
    const startYear = startDate.getUTCFullYear();
    const endMonth = MONTH_NAMES[endDate.getUTCMonth()];
    const endYear = endDate.getUTCFullYear();

    // Entire single calendar year (e.g. 2027-01-01 to 2027-12-31)
    if (
      startDate.getUTCMonth() === 0 &&
      startDate.getUTCDate() === 1 &&
      endDate.getUTCMonth() === 11 &&
      endDate.getUTCDate() >= 28 &&
      startYear === endYear
    ) {
      return `throughout ${startYear}`;
    }

    // Same year (e.g. June 2027 to November 2027)
    if (startYear === endYear) {
      if (startMonth === endMonth) {
        return `${startMonth} ${startYear}`;
      }
      return `${startMonth} to ${endMonth} ${startYear}`;
    }

    // Cross-year span (e.g. July 2026 to March 2028)
    return `${startMonth} ${startYear} to ${endMonth} ${endYear}`;
  }

  /**
   * Cleans technical labels into natural phrasing.
   */
  private cleanLabel(rawLabel: string): string {
    return rawLabel
      .replace(/Window/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
