import chalk from 'chalk';
import { Service } from 'typedi';

@Service()
export class Logger {
  private getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();

    return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  }

  log(message: string) {
    const time = this.getCurrentTime();
    console.log(
      chalk.green(`[${time}]`) +
        ' ' +
        chalk.yellow(`[INFO]`) +
        ' ' +
        chalk.green(message)
    );
  }

  warn(message: string) {
    const time = this.getCurrentTime();
    console.log(
      chalk.yellow(`[${time}]`) +
        ' ' +
        chalk.yellow(`[WARN]`) +
        ' ' +
        chalk.yellow(message)
    );
  }

  error(message: string) {
    const time = this.getCurrentTime();
    console.log(
      chalk.red(`[${time}]`) +
        ' ' +
        chalk.yellow(`[ERROR]`) +
        ' ' +
        chalk.red(message)
    );
  }
}
