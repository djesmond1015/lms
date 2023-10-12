import { Document, Model } from 'mongoose';

interface IMonthData {
  month: string;
  count: number;
}

export const generateLast12MonthsData = async <T extends Document>(
  model: Model<T>
): Promise<{ last12Months: IMonthData[] }> => {
  const last12Months: IMonthData[] = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      currentDate.getDate()
    );

    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth() - 1,
      endDate.getDate()
    );

    const monthYear = endDate.toLocaleString('default', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    last12Months.push({ month: monthYear, count });
  }
  return { last12Months };
};
