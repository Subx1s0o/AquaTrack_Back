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
    date: string;
    amount: number;
    percentage: number;
  }[] {
    if (!this.timestamp) {
      throw new Error('Date is not set. Use setDate() first.');
    }

    return Array.from({ length: lastDayOfMonth }, (_, i) => ({
      date: this.formatDate(
        new Date(
          Date.UTC(
            this.timestamp.getUTCFullYear(),
            this.timestamp.getUTCMonth(),
            i + 1
          )
        )
      ),
      amount: 0,
      percentage: 0
    }));
  }

  /**
   * Групує записи про споживання води за днями місяця.
   * @param records Масив записів із кількістю, датою та відсотками.
   * @returns Об'єкт, де ключі - це дні місяця, а значення - сума даних для цього дня.
   */
  groupRecords(
    records: { amount: number; date: string; percentage: number }[]
  ): Record<number, { amount: number; date: string; percent: number }> {
    const groupedByDate: Record<
      number,
      { amount: number; date: string; percent: number }
    > = {};

    records.forEach(({ date, amount, percentage }) => {
      const day = new Date(date).getUTCDate();
      const dateFormatted = this.formatDate(new Date(date));

      if (!groupedByDate[day]) {
        groupedByDate[day] = { amount: 0, date: dateFormatted, percent: 0 };
      }

      groupedByDate[day].amount += amount;
      groupedByDate[day].percent += percentage;
    });

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
      { amount: number; date: string; percent: number }
    >
  ): { date: string; amount: number; percentage: number }[] {
    if (!this.timestamp) {
      throw new Error('Date is not set. Use setDate() first.');
    }

    return Array.from({ length: lastDayOfMonth }, (_, i) => {
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
        percent: 0
      };

      return {
        date: dayData.date,
        amount: dayData.amount,
        percentage: parseFloat(dayData.percent.toFixed(2))
      };
    });
  }
}
