

package com.FarmConnect.WebApplication.model;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(
        collection = "wholesaler"
)
public class Wholesaler {
    @Id
    private String _id;
    private String fullName;
    private String email;
    private String address;
    private long phoneNumber;
    private String password;
    private List<ConfirmedDeals> confirmedDeals;

    public String get_id() {
        return this._id;
    }

    public String getFullName() {
        return this.fullName;
    }

    public String getEmail() {
        return this.email;
    }

    public String getAddress() {
        return this.address;
    }

    public long getPhoneNumber() {
        return this.phoneNumber;
    }


    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<ConfirmedDeals> getConfirmedDeals() {
        return this.confirmedDeals;
    }

    public void set_id(final String _id) {
        this._id = _id;
    }

    public void setFullName(final String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(final String email) {
        this.email = email;
    }

    public void setAddress(final String address) {
        this.address = address;
    }

    public void setPhoneNumber(final long phoneNumber) {
        this.phoneNumber = phoneNumber;
    }


    public void setConfirmedDeals(final List<ConfirmedDeals> confirmedDeals) {
        this.confirmedDeals = confirmedDeals;
    }

    public boolean equals(final Object o) {
        if (o == this) {
            return true;
        } else if (!(o instanceof Wholesaler)) {
            return false;
        } else {
            Wholesaler other = (Wholesaler)o;
            if (!other.canEqual(this)) {
                return false;
            } else if (this.getPhoneNumber() != other.getPhoneNumber()) {
                return false;
            } else {
                Object this$_id = this.get_id();
                Object other$_id = other.get_id();
                if (this$_id == null) {
                    if (other$_id != null) {
                        return false;
                    }
                } else if (!this$_id.equals(other$_id)) {
                    return false;
                }

                Object this$fullName = this.getFullName();
                Object other$fullName = other.getFullName();
                if (this$fullName == null) {
                    if (other$fullName != null) {
                        return false;
                    }
                } else if (!this$fullName.equals(other$fullName)) {
                    return false;
                }

                Object this$email = this.getEmail();
                Object other$email = other.getEmail();
                if (this$email == null) {
                    if (other$email != null) {
                        return false;
                    }
                } else if (!this$email.equals(other$email)) {
                    return false;
                }

                Object this$address = this.getAddress();
                Object other$address = other.getAddress();
                if (this$address == null) {
                    if (other$address != null) {
                        return false;
                    }
                } else if (!this$address.equals(other$address)) {
                    return false;
                }

                Object this$password = this.getPassword();
                Object other$password = other.getPassword();
                if (this$password == null) {
                    if (other$password != null) {
                        return false;
                    }
                } else if (!this$password.equals(other$password)) {
                    return false;
                }

                Object this$confirmedDeals = this.getConfirmedDeals();
                Object other$confirmedDeals = other.getConfirmedDeals();
                if (this$confirmedDeals == null) {
                    if (other$confirmedDeals != null) {
                        return false;
                    }
                } else if (!this$confirmedDeals.equals(other$confirmedDeals)) {
                    return false;
                }

                return true;
            }
        }
    }

    protected boolean canEqual(final Object other) {
        return other instanceof Wholesaler;
    }

    public int hashCode() {
        int PRIME = 59;
        int result = 1;
        long $phoneNumber = this.getPhoneNumber();
        result = result * 59 + (int)($phoneNumber >>> 32 ^ $phoneNumber);
        Object $_id = this.get_id();
        result = result * 59 + ($_id == null ? 43 : $_id.hashCode());
        Object $fullName = this.getFullName();
        result = result * 59 + ($fullName == null ? 43 : $fullName.hashCode());
        Object $email = this.getEmail();
        result = result * 59 + ($email == null ? 43 : $email.hashCode());
        Object $address = this.getAddress();
        result = result * 59 + ($address == null ? 43 : $address.hashCode());
        Object $password = this.getPassword();
        result = result * 59 + ($password == null ? 43 : $password.hashCode());
        Object $confirmedDeals = this.getConfirmedDeals();
        result = result * 59 + ($confirmedDeals == null ? 43 : $confirmedDeals.hashCode());
        return result;
    }

    public String toString() {
        String var10000 = this.get_id();
        return "Wholesaler(_id=" + var10000 + ", fullName=" + this.getFullName() + ", email=" + this.getEmail() + ", address=" + this.getAddress() + ", phoneNumber=" + this.getPhoneNumber() + ", password=" + this.getPassword() + ", confirmedDeals=" + String.valueOf(this.getConfirmedDeals()) + ")";
    }

    public Wholesaler(final String _id, final String fullName, final String email, final String address, final long phoneNumber, final String password, final List<ConfirmedDeals> confirmedDeals) {
        this._id = _id;
        this.fullName = fullName;
        this.email = email;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.confirmedDeals = confirmedDeals;
    }

    public Wholesaler() {
    }
}
