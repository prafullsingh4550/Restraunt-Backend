

### **Step 1: Completely remove the old credentials**

#### **Option A: Using Keychain Access (simplest)**

1. Open **Keychain Access** (Finder → Applications → Utilities → Keychain Access).
2. Search for `github.com`.
3. Delete **all entries** related to GitHub, especially ones with account `prafullasingh-1234`.

---

#### **Option B: Using terminal**

Run these commands to ensure Git forgets any cached credentials:

```bash
# Unset any credential helper temporarily
git config --global --unset credential.helper

# Delete all saved credentials for github.com
printf "host=github.com\nprotocol=https\n" | git credential-osxkeychain erase
```

> The `printf` method pipes the required input to the erase command, which avoids it “sticking.”

---

### **Step 2: Set correct remote URL**

Check which remote you’re pushing to:

```bash
git remote -v
```

It should show:

```
origin  https://github.com/prafullsingh4550/Restraunt-Backend.git (fetch)
origin  https://github.com/prafullsingh4550/Restraunt-Backend.git (push)
```

If it shows a URL with `prafullasingh-spotline`, fix it:

```bash
git remote set-url origin https://github.com/prafullsingh4550/Restraunt-Backend.git
```

---

### **Step 3: Push with Personal Access Token (PAT)**

Now try pushing:

```bash
git push -u origin main
```

* Git will prompt for username/password:

  * **Username:** `prafullsingh4550`
  * **Password:** your **Personal Access Token (PAT)**

---

### **Step 4: Optional — Save the PAT in Keychain**

So you won’t have to enter it again:

```bash
git config --global credential.helper osxkeychain
```

Then push again; it will save the PAT securely in Keychain.

---

💡 **Tip:** If this still fails, the **cleanest solution** is to switch to **SSH** instead of HTTPS. That avoids any Keychain / PAT issues entirely.

I can give you the **SSH setup steps** so you can push without worrying about GitHub accounts at all. Do you want me to do that?
