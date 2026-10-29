import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export default function DeleteAccountDialog({
  account,
  accountType,
  isDeleting,
  onOpenChange,
  onConfirm,
}) {
  const [adminPassword, setAdminPassword] = useState("");
  const isOpen = Boolean(account);

  useEffect(() => {
    if (!isOpen) setAdminPassword("");
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    await onConfirm(adminPassword);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {account && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {accountType} account?</DialogTitle>
            <DialogDescription>
              This permanently deletes {account.userName}&apos;s account and
              cannot be undone.
              {accountType === "teacher" &&
                " Their courses will remain available to students."}
              {" "}Enter your administrator password to confirm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-admin-password">
                Administrator password
              </Label>
              <Input
                id="delete-admin-password"
                type="password"
                autoComplete="current-password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : `Delete ${accountType}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

DeleteAccountDialog.propTypes = {
  account: PropTypes.shape({
    userName: PropTypes.string,
  }),
  accountType: PropTypes.oneOf(["student", "teacher"]).isRequired,
  isDeleting: PropTypes.bool,
  onOpenChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

DeleteAccountDialog.defaultProps = {
  account: null,
  isDeleting: false,
};
