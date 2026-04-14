# Terraform From State

This folder contains Terraform configuration generated manually from the current `terraform/terraform.tfstate`.

## Important Notes

- This is a reconstruction from state, not an official reverse-generation
- Sensitive values like database passwords are not present in state output here
- Some computed attributes from state are intentionally omitted
- Review everything before using it for planning or apply

## Purpose

Use this as a separate reference copy so you can compare:

- current handwritten Terraform in `terraform/`
- state-derived Terraform in `terraform_from_state/`

## Warning

Do not assume this folder is ready for `terraform apply` without review.
