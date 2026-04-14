# Ansible

This folder contains the EC2 configuration automation for the 3-tier app.

Terraform should manage AWS infrastructure such as EC2, RDS, security groups, and networking.
Ansible should manage what is installed and configured inside the EC2 instance.

## Safe Workflow

1. Run `audit.yml` first.
2. Review the audit output.
3. Only run `playbook.yml` if something is missing or broken and you intentionally want Ansible to fix it.

## What `audit.yml` Checks

- Node.js installation
- npm installation
- PM2 installation and process state
- Nginx installation and service state
- backend and frontend directories
- backend `.env` presence
- Nginx config presence
- backend API on port `3000`
- Nginx proxy on port `80`

`audit.yml` is read-only and should not change the server.

## What `playbook.yml` Does

- installs packages
- deploys backend and frontend files
- writes backend `.env`
- writes Nginx config
- installs backend dependencies
- manages PM2

`playbook.yml` can modify the EC2 instance and should be treated as a remediation/deployment playbook.

## Expected Layout

```text
ansible/
|-- inventory.ini
|-- audit.yml
|-- playbook.yml
|-- group_vars/
|   `-- all.yml
`-- templates/
    |-- backend.env.j2
    `-- nginx-default.conf.j2
```

## Usage

1. Copy `inventory.ini.example` to `inventory.ini`
2. Update the host IP, SSH user, and private key path
3. Review `group_vars/all.yml`
4. Fill in the database values
5. Run the audit first:

```bash
ansible-playbook -i inventory.ini audit.yml
```

6. Only if needed, run remediation:

```bash
ansible-playbook -i inventory.ini playbook.yml
```
