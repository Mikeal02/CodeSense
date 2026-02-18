import { motion } from "framer-motion";
import { Code2, Github, Twitter, Heart, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-12 sm:py-16 border-t border-border/50"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">CodeSense</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Turn confusion into confidence. Understand your code, ace your interviews, 
              and ship with clarity.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider text-muted-foreground">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">AI Code Analysis</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Interview Preparation</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Dependency Graphs</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Code Metrics</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">File Comparison</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider text-muted-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Keyboard Shortcuts</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Changelog</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm uppercase tracking-wider text-muted-foreground">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <Twitter className="w-4 h-4" /> Twitter
              </li>
              <li className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
                <Mail className="w-4 h-4" /> Contact
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-destructive" /> by developers, for developers
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CodeSense. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
