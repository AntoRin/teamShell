import { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

function ConfirmDialog({
   setNotificationProgress,
   confirmationRequired,
   setConfirmationRequired,
   title,
   message,
}) {
   const [dialogOpen, setDialogOpen] = useState(false);

   useEffect(() => {
      setDialogOpen(confirmationRequired);
   }, [confirmationRequired]);

   function handleDialogClose() {
      setConfirmationRequired(false);
   }

   function handleDialogSuccess() {
      setNotificationProgress(prev => ({ ...prev, pending: false }));
      setConfirmationRequired(false);
   }

   return (
      <>
         <Dialog
            disableBackdropClick={false}
            open={dialogOpen}
            onClose={handleDialogClose}
         >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
               <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleDialogClose} color="primary">
                  Disagree
               </Button>
               <Button onClick={handleDialogSuccess} color="primary" autoFocus>
                  Agree
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
}

export default ConfirmDialog;
