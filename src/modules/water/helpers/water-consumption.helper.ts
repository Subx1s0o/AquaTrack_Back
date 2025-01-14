import { IWaterConsumption } from '@/types/WaterConsumption';
import { Service } from 'typedi';

/**
 * Сервіс для допоміжних операцій зі споживання води.
 */
@Service()
export class WaterConsumptionHelper {
  private timestamp: Date = new Date();

  /**
   * Ініціалізація сервісу зі встановленням дати.
   * @param date Дата у форматі рядка (наприклад, "2025-01-01").
   * @throws Помилка, якщо формат дати є недійсним.
   */
  setDate(date: string): void {
    this.timestamp = new Date(date);
    if (isNaN(this.timestamp.getTime())) {
      throw new Error('Invalid date format');
    }
  }

  private ensureDateSet(): void {
    if (!this.timestamp) {
      throw new Error('Date is not set. Use setDate() first.');
    }
  }

  /**
   * Обчислює межі місяця (початок, кінець) та кількість днів у місяці.
   * @returns Об'єкт із датами початку, кінця місяця та кількістю днів у місяці.
   */
  getMonthBoundaries(): {
    startOfMonth: Date;
    endOfMonth: Date;
    lastDayOfMonth: number;
  } {
    if (!this.timestamp) {
      throw new Error('Date is not set. Use setDate() first.');
    }

    const firstDayOfMonth = new Date(
      this.timestamp.getUTCFullYear(),
      this.timestamp.getUTCMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      this.timestamp.getUTCFullYear(),
      this.timestamp.getUTCMonth() + 1,
      0
    ).getDate();

    const startOfMonth = new Date(firstDayOfMonth.setUTCHours(0, 0, 0, 0));
    const endOfMonth = new Date(
      this.timestamp.getUTCFullYear(),
      this.timestamp.getUTCMonth(),
      lastDayOfMonth,
      23,
      59,
      59,
      999
    );

    return { startOfMonth, endOfMonth, lastDayOfMonth };
  }

  /**
   * Форматує дату у рядок у форматі "YYYY-MM-DD".
   * @param date Дата, яку потрібно форматувати.
   * @returns Відформатована дата у вигляді рядка.
   */
  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Створює масив із пустими даними для кожного дня місяця.
   * @param lastDayOfMonth Кількість днів у місяці.
   * @returns Масив об'єктів із датою, кількістю (0) та відсотком (0).
   */
  createEmptyMonthlyData(lastDayOfMonth: number): {
    records: IWaterConsumption[];
    totalPercentage: number;
  } {
    this.ensureDateSet();
    const currentDate = new Date(
      Date.UTC(this.timestamp.getUTCFullYear(), this.timestamp.getUTCMonth(), 1)
    );

    const records: IWaterConsumption[] = Array.from(
      { length: lastDayOfMonth },
      () => {
        const result = {
          date: this.formatDate(currentDate),
          amount: 0,
          totalPercentage: 0
        };
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        return result;
      }
    );

    return { records, totalPercentage: 0 };
  }

  /**
   * Групує записи про споживання води за днями місяця.
   * @param records Масив записів із кількістю, датою та відсотками.
   * @returns Об'єкт, де ключі - це дні місяця, а значення - сума даних для цього дня.
   */
  groupRecords(
    records: { amount: number; date: string }[],
    dailyNorm: number
  ): Record<number, { amount: number; date: string; totalPercentage: number }> {
    const groupedByDate: Record<
      number,
      { amount: number; date: string; totalPercentage: number }
    > = {};

    for (const { date, amount } of records) {
      const recordDate = new Date(date);
      const day = recordDate.getUTCDate();
      const formattedDate = this.formatDate(recordDate);

      if (!groupedByDate[day]) {
        groupedByDate[day] = {
          amount: 0,
          date: formattedDate,
          totalPercentage: 0
        };
      }

      groupedByDate[day].amount += amount;

      groupedByDate[day].totalPercentage =
        (groupedByDate[day].amount / dailyNorm) * 100;

      groupedByDate[day].totalPercentage = parseFloat(
        groupedByDate[day].totalPercentage.toFixed(2)
      );
    }

    return groupedByDate;
  }

  /**
   * Генерує підсумковий масив даних для всього місяця.
   * @param lastDayOfMonth Кількість днів у місяці.
   * @param groupedByDate Об'єкт, що містить дані, згруповані за днями місяця.
   * @returns Масив об'єктів із даними для кожного дня.
   */
  generateResult(
    lastDayOfMonth: number,
    groupedByDate: Record<
      number,
      { amount: number; date: string; totalPercentage: number }
    >
  ): { records: IWaterConsumption[]; totalPercentage: number } {
    this.ensureDateSet();

    let totalPercentage = 0;
    const records = Array.from({ length: lastDayOfMonth }, (_, i) => {
      const day = i + 1;
      const dayData = groupedByDate[day] || {
        amount: 0,
        date: this.formatDate(
          new Date(
            Date.UTC(
              this.timestamp.getUTCFullYear(),
              this.timestamp.getUTCMonth(),
              day
            )
          )
        ),
        totalPercentage: 0
      };

      totalPercentage += dayData.totalPercentage;

      return {
        date: dayData.date,
        amount: dayData.amount,
        totalPercentage: dayData.totalPercentage
      };
    });

    return { records, totalPercentage };
  }
}
