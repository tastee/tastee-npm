import * as ICommand from 'commander';

declare namespace commander {
    interface IExportedCommand extends ICommand {
        user: string; 
        pass: string;
    }
}