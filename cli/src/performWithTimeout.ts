
import ora from "ora";

type SpinnerOptions<T> = {
  timeout: number,
  spinnerText: string,
  doneText?: string | ((d: T) => string),
  timeoutText?: string,
  failedText?: string,
}

type SpinnerReturn<T> = {
    success: true,
    data: T
} | {
    success: false,
    reason: "error" | "timeout",
    error: string,
}

export const performWithSpinner = async <T>(cb: () => Promise<T>, opts: Partial<SpinnerOptions<T>> & Pick<SpinnerOptions<T>, "spinnerText">): Promise<SpinnerReturn<T>> => {
   const spinnerOpts: SpinnerOptions<T> = {
    timeout: 30000,
    timeoutText: `${opts.spinnerText} timed out`,
    failedText: `${opts.spinnerText} failed`,
    doneText: `${opts.spinnerText} Done`,
    ...opts,
   };

   const spinner = ora(spinnerOpts.spinnerText).start();
   const timeoutPromise = new Promise<SpinnerReturn<T>>((res) => {
    setTimeout(() => 
        res({success: false, reason: "timeout", error: "operation timed out" }), 
    spinnerOpts.timeout);
   });
   const action = cb()
     .then(d => ({ success: true, data: d }) as SpinnerReturn<T>)
     .catch(e => ({ success: false, reason: "error", error: e }) as SpinnerReturn<T>)
    
    try {
        const ret = await Promise.race([timeoutPromise, action]);
        if (ret.success) {
            let txt = spinnerOpts.doneText;
            if (typeof txt === "function") {
                txt = txt(ret.data);
            }
            if (txt === undefined) {
                spinner.succeed();
            } else {
                spinner.succeed(txt);
            }
        } else {
            if (ret.success === false) {
                 const txtToUse = ret.reason === "timeout" ? spinnerOpts.timeoutText : spinnerOpts.failedText;
                spinner.fail(txtToUse);
                console.error(ret.error)
            } 
        }
        return ret;
    } catch (e) {
        spinner.fail();
        console.error(e);
        return {
            success: false,
            reason: "error",
            error: e,
        }
    }
}