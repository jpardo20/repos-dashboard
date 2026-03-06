class Repository {

    constructor(fullName) {

        this.fullName = fullName;

        const parts = fullName.split("/");

        this.owner = parts[0];
        this.name = parts[1];

    }

    getFullName() {
        return this.fullName;
    }

    getOwner() {
        return this.owner;
    }

    getName() {
        return this.name;
    }

}