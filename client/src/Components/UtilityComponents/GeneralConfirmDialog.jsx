import { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function AlertDialog({
   confirmationRequired,
   handleConfirmationSuccess,
   handleConfirmationFailure,
   title,
   body,
}) {
   const [open, setOpen] = useState(confirmationRequired);

   useEffect(() => {
      setOpen(confirmationRequired);
   }, [confirmationRequired]);

   function handleClose() {
      setOpen(false);
   }

   return (
      <div>
         <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
               <DialogContentText>{body}</DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleConfirmationFailure} color="primary">
                  Disagree
               </Button>
               <Button
                  onClick={handleConfirmationSuccess}
                  color="primary"
                  autoFocus
               >
                  Agree
               </Button>
            </DialogActions>
         </Dialog>
      </div>
   );
}
